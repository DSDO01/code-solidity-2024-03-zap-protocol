// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/ITokenSale.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IERC20D.sol";
import "./interfaces/IPancakeRouter01.sol";
import "./interfaces/IPancakeFactory.sol";
// import "hardhat/console.sol";

/*
A tokensale includes 3 stages: 
1. Private round. Only ion token holders can participate in this round. 
 The Matic/USDB price is fixed in the beginning of the tokensale.
 All tokens available in the pre-sale will be made available through the private sale round. 
 A single investor can purchase up to their maximum allowed investment defined by the tier.
 Investors can claim their tokens only when the private round is finished. 
 If the total supply is higher than the total demand for this tokensale, investors purchase tokens up to their max allocation. 
 If the the demand is higher than supply, the number of tokens investors will receive is adjusted, and then the native token used to invest are partially refunded.
*/


contract TokenSaleUSDB is Initializable, ITokenSale {
    using SafeERC20 for IERC20D;

    uint256 constant POINT_BASE = 10000;
    uint256 constant ETH_DECIMAL = 18;
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    address public marketingWallet;
    address public creator;

    uint256 public maxAllocation; // in dollar with decimals
    uint256 public platformTax; // base 10000
    uint256 public lockinPeriod; // lockin
    uint256 public tokenPrice;

    bool public isKYCEnabled;
    bool public liqAdded;

    Params public params;
    Config public config;
    IERC20D public USDB;
    IPancakeRouter01 public router;
    IPancakeFactory public factory;
    IAdmin admin;
    /**
     * @dev current tokensale stage (epoch)
     */
    Epoch public epoch;
    bool isRaiseClaimed;
    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    address[] public usersOnDeposit;

    mapping(address => Staked) public stakes;
    mapping(address => uint256) public tokensaleTiers;
    /** @dev Decrease result by 1 to access correct position */
    mapping(address => uint256) public userDepositIndex;

    State public state;

    function initialize(
        Params calldata _params,
        address _admin,
        address _creator,
        uint256 _maxAllocation,
        uint256 _platformTax,
        bool _isKYC
    ) external initializer {
        params = _params;
        admin = IAdmin(_admin);
        creator = _creator;
        state.totalSupplyInValue = _maxAllocation;
        
        USDB = IERC20D(0xA9F81589Cc48Ff000166Bf03B3804A0d8Cec8114); //for testnet
        // USDB = IERC20D(0x5FbDB2315678afecb367f032d93F642f64180aa3); //for testcases
        marketingWallet = admin.wallet();
        maxAllocation = _maxAllocation;
        platformTax = _platformTax;
        router = IPancakeRouter01(params.router);
        factory = IPancakeFactory(router.factory());
        isKYCEnabled = _isKYC;
        liqAdded = true;
        tokenPrice = (_maxAllocation * 10 ** IERC20D(params.tokenAddress).decimals()) / _params.totalSupply;
    }

    function setConfig(Config memory _config, address _creator) external {
        require(creator == _creator,"Only Creator can Call");
        require(config.NoOfVestingIntervals == 0,"Already triggered");
        config = _config;
    }

    // allocation is amount in dollar without decimals
    function userWhitelistAllocation(
        address[] calldata users,
        uint256[] calldata allocations
    ) public {
        require(admin.hasRole(OPERATOR, msg.sender), "onlyOperator");
        require(
            users.length == allocations.length,
            "Invalid length"
        );
        for (uint256 i = 0; i < users.length; i++)  tokensaleTiers[users[i]] = allocations[i];
    }

    /**
     * @dev setup the current tokensale stage (epoch)
     */
    function checkingEpoch() internal {
        uint256 time = block.timestamp;
        if (
            epoch != Epoch.Private &&
            time >= params.saleStart &&
            time <= params.saleEnd
        ) {
            epoch = Epoch.Private;
            return;
        }
        if ((epoch != Epoch.Finished && (time > params.saleEnd))) {
            epoch = Epoch.Finished;
            lockinPeriod = uint32(block.timestamp);
            return;
        }
    }


    // to save size
    function _onlyAdmin() internal view {
        require(
            admin.hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                msg.sender == address(admin),
            "onlyadmin"
        );
    }

    /**
     * @dev invest USDB to the tokensale 
     */
    function deposit(uint256 _amount) external {
        // console.log("kyc enabled", isKYCEnabled);
        if (isKYCEnabled) require(admin.isKYCDone(msg.sender) == true, "KYC not done");
        address sender = msg.sender;
        require(
            !admin.blacklist(address(this), sender),
            "Blacklisted"
        );
        checkingEpoch();

        require(epoch == Epoch.Private, "Incorrect time");
        require(_amount > 0, "0 deposit");

        if (userDepositIndex[sender] == 0) {
            usersOnDeposit.push(sender);
            userDepositIndex[sender] = usersOnDeposit.length;
        }
        if (epoch == Epoch.Private) _processPrivate(sender, _amount);
    }

    /**
     * @dev processing USDB investment
     * @param _sender - transaction sender
     * @param _amount - investment amount in USDB
     */
    function _processPrivate(address _sender, uint256 _amount) internal {
        require(_amount > 0, "Too small");

        Staked storage s = stakes[_sender];
        uint256 amount = _amount;
        uint256 sum = s.amount + amount;
        
        uint256 maxAllocationOfUser = tokensaleTiers[_sender] == 0 ? params.baseLine : tokensaleTiers[_sender];
        // console.log(maxAllocationOfUser, sum);
        require(sum <= maxAllocationOfUser, "upto max allocation");

        s.amount += amount;
        state.totalSold += amount;
        USDB.safeTransferFrom(_sender, address(this), amount);

        /**@notice Forbid unstaking*/
        emit DepositPrivate(_sender, _amount, address(this));
    }
   
    function takeUSDBRaised() public {
        checkingEpoch();
        require(epoch == Epoch.Finished, "Not time yet");
        require(!isRaiseClaimed, "Already paid");

        uint256 earned = state.totalSold > state.totalSupplyInValue ? state.totalSupplyInValue : state.totalSold;

        isRaiseClaimed = true;
        if (earned > 0) {
            uint earning = (earned * (platformTax))/POINT_BASE;
            USDB.safeTransfer(admin.wallet(), earning);
            earned = (earned * (POINT_BASE - params.liqudityPercentage))/POINT_BASE;
            USDB.safeTransfer(creator, earned - earning);
        }
        if (state.totalSold < state.totalSupplyInValue){
            uint unsold = state.totalSupplyInValue - state.totalSold;
            uint unsoldTokens = (unsold * (10 ** ETH_DECIMAL))/ tokenPrice;
            if(params.burnUnsold){
                IERC20D(params.tokenAddress).safeTransfer(0x000000000000000000000000000000000000dEaD, unsoldTokens);
            }else{
                IERC20D(params.tokenAddress).safeTransfer(creator, unsoldTokens);
            }
        }

        emit RaiseClaimed(creator, earned);
    }

    function addLiq() external {
        require(isRaiseClaimed, "takeUSDBRaised not called");
        require(block.timestamp >= lockinPeriod + config.LiqGenerationTime, "Lockin period is not over yet");
        require(liqAdded,"liqAdded");
        uint USDBAmount = state.totalSold > state.totalSupplyInValue ?
            state.totalSupplyInValue : state.totalSold;
        USDBAmount = (USDBAmount * (params.liqudityPercentage))/POINT_BASE;
        
        uint tokenAmount = state.totalSold > state.totalSupplyInValue ? params.tokenLiquidity : 
            params.tokenLiquidity * state.totalSold / state.totalSupplyInValue;
            
        USDB.approve(address(router), USDBAmount);     
        IERC20D(params.tokenAddress).approve(address(router), tokenAmount); 
        router.addLiquidity(
            address(USDB),
            params.tokenAddress,
            USDBAmount,
            tokenAmount,
            0,
            0,
            address(this),
            block.timestamp + 10 minutes
        );
        if(params.tokenLiquidity - tokenAmount > 0) IERC20D(params.tokenAddress).transfer(creator, params.tokenLiquidity - tokenAmount);
        lockinPeriod = block.timestamp;
        liqAdded = false;
    }

    function claimLP() external {
        require(isRaiseClaimed && !liqAdded, "takeUSDBRaised || addliq not called");
        require(block.timestamp >= lockinPeriod + config.LPLockin, "Lockin period is not over yet");
        address pair = factory.getPair(address(USDB),params.tokenAddress);
        uint256 liquidity = IERC20D(pair).balanceOf(address(this));
        if (liquidity > 0) IERC20D(pair).transfer(creator,liquidity);
    }
    
    function claim() external {
        require(isRaiseClaimed, "takeUSDBRaised not called");
        require(
            uint8(epoch) > 1 && !admin.blockClaim(address(this)),
            "Not time or not allowed"
        );

        Staked storage s = stakes[msg.sender];
        require(s.amount != 0, "No Deposit");
        if(s.share == 0) (s.share, s.left) = _claim(s);
        require(s.left != 0, "Nothing to Claim");

        if(s.left > 0){
            uint bal = USDB.balanceOf(address(this));
            uint left = s.left < bal ? s.left : bal;
            USDB.safeTransfer(msg.sender, left);
            s.left -= s.left;
            emit Claim(msg.sender, left);
        }
    }

    function vesting() external {
        require(isRaiseClaimed && !liqAdded, "takeUSDBRaised || addLiq not called");
        require(uint32(block.timestamp) >= lockinPeriod + config.vestingPeriod, "vesting period is not over yet");
        require(
            uint8(epoch) > 1 && !admin.blockClaim(address(this)),
            "Not time or not allowed"
        );

        Staked storage s = stakes[msg.sender];
        require(s.amount != 0, "No Deposit");
        if(s.share == 0) (s.share, s.left) = _claim(s);
        uint decimalDiffrence = USDB.decimals() - IERC20D(params.tokenAddress).decimals();
        uint bal = IERC20D(params.tokenAddress).balanceOf(address(this));
        uint amountFinal;
        if(s.amountFinal == 0){
            amountFinal = decimalDiffrence == 0 ?
                (s.share * (10 ** ETH_DECIMAL))/ tokenPrice < bal ?
                    (s.share * (10 ** ETH_DECIMAL))/ tokenPrice : bal :
                    s.share * (10 ** ETH_DECIMAL)/ ((10 ** decimalDiffrence) * tokenPrice) > bal ?
                s.share * (10 ** ETH_DECIMAL)/ ((10 ** decimalDiffrence) * tokenPrice) : bal;
            s.amountFinal = amountFinal;
        }else{
            amountFinal = s.amountFinal;
        }
        require(amountFinal > s.claimed, "Already Claimed");

        uint vestingIntervals = block.timestamp < (lockinPeriod + config.vestingPeriod + config.vestingDistribution) ? 1 :
         ((block.timestamp - lockinPeriod - config.vestingPeriod) / config.vestingDistribution) + 1;
        uint amount;
        if(vestingIntervals > config.NoOfVestingIntervals) 
            vestingIntervals = config.NoOfVestingIntervals;
        require(vestingIntervals > s.vestingPoint,"Already claimed for this point");
        if(vestingIntervals == config.NoOfVestingIntervals){
            amount = amountFinal - s.claimed;
        }else{ 
            uint amountFirst = (amountFinal * config.FirstVestPercentage) / POINT_BASE;
            amount = amountFirst;
            if(vestingIntervals > 1){
                uint claimed = s.claimed > 0 ? s.claimed - amountFirst : 0;
                amount = amountFinal - amountFirst;
                amount = ((amount * (vestingIntervals - 1)) / (config.NoOfVestingIntervals - 1)) - claimed;
                if(s.claimed == 0) amount += amountFirst;
            }
        }
        s.vestingPoint = vestingIntervals;
        s.claimed += amount;
        IERC20D(params.tokenAddress).safeTransfer(msg.sender, amount);

        emit Vest(msg.sender, amount);
        
    }

    function _claim(Staked memory _s) internal view returns (uint256, uint256 left) {
        if (state.totalSold > state.totalSupplyInValue) {
            _s.share = (_s.amount * state.totalSupplyInValue) / state.totalSold;
            left = _s.amount - _s.share;
        } else {
            _s.share = _s.amount;
        }

        return (_s.share, left);
    }

    function canClaim(address _user) external view returns (uint256, uint256) {
        return _claim(stakes[_user]);
    }

    /**
     * @dev sends Locked USDB to admin wallet
     */

    function takeLocked() external {
        _onlyAdmin();
        require(
            block.timestamp >= (params.saleEnd + 2592e3),
            "Not ended"
        );
        uint amountUSDB =USDB.balanceOf(address(this));
        if (amountUSDB > 0) USDB.safeTransfer(admin.wallet(), amountUSDB);
    }

}
