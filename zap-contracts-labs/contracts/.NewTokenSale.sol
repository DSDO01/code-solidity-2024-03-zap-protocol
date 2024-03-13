// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./interfaces/ITokenSale.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IERC20D.sol";
import "./interfaces/IPancakeRouter01.sol";
import "./interfaces/IPancakeFactory.sol";
import "hardhat/console.sol";

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


contract TokenSale is Initializable, ITokenSale {
    using SafeERC20 for IERC20D;

    uint256 constant PCT_BASE = 10**6;
    uint256 constant POINT_BASE = 10000;
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    address public marketingWallet;
    address public creator;

    uint256 public maxAllocation; // in dollar with decimals
    uint256 public platformTax; // base 10000
    uint256 public lockinPeriod; // lockin
    uint256 public baseLine; // baseLine

    bool public isKYCEnabled;

    Params params;
    IERC20D public USDB;
    IPancakeRouter01 public router;
    IPancakeFactory public factory;
    IAdmin admin;
    /**
     * @dev current tokensale stage (epoch)
     */
    Epoch public override epoch;
    bool isRaiseClaimed;
    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    address[] public usersOnDeposit;

    mapping(address => Staked) public override stakes;
    mapping(address => uint256) public tokensaleTiers;
    /** @dev Decrease result by 1 to access correct position */
    mapping(address => uint256) public userDepositIndex;

    State state;

    receive() external payable {}

    function getState() external view returns (uint128, uint128) {
        return (state.totalSold, state.totalSupplyInValue);
    }

    function initialize(
        Params calldata _params,
        address _admin,
        address _creator,
        uint256 _maxAllocation,
        uint256 _platformTax,
        address _router,
        address _factory,
        bool _isKYC
    ) external initializer {
        params = _params;
        admin = IAdmin(_admin);
        creator = _creator;
        state.totalSupplyInValue = uint128(
            (uint256(_params.totalSupply) *
                uint256(_params.tokenPrice)) / 10**18
        );
        USDB = IERC20D(0xA9F81589Cc48Ff000166Bf03B3804A0d8Cec8114); 
        marketingWallet = admin.wallet();
        maxAllocation = _maxAllocation;
        platformTax = _platformTax;
        router = IPancakeRouter01(_router);
        factory = IPancakeFactory(_factory);
        isKYCEnabled = _isKYC;
    }

    // allocation is amount in dollar without decimals
    function userWhitelistAllocation(
        address[] calldata users,
        uint256[] calldata allocations
    ) public {
        require(admin.hasRole(OPERATOR, msg.sender), "TokenSale: OnlyOperator");
        require(
            users.length == allocations.length,
            "TokenSale: Invalid length"
        );
        for (uint256 i = 0; i < users.length; i++) {
            tokensaleTiers[users[i]] = allocations[i];
        }
    }

    function setAllocationAndTax(uint256[3] calldata _allocations) external {
        require(block.timestamp <= params.saleStart, "Time lapsed");
        require(admin.hasRole(OPERATOR, msg.sender), "TokenSale: OnlyOperator");
        maxAllocation = _allocations[0];
        platformTax = _allocations[1];
    }

    function setMarketingWallet(address _wallet) external {
        _onlyAdmin();
        marketingWallet = _wallet;
    }

    /**
     * @dev setup the current tokensale stage (epoch)
     */
    function checkingEpoch() public {
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
            _addLiq();
            lockinPeriod = block.timestamp;
            return;
        }
    }

    // to save size
    function _onlyAdmin() internal view {
        require(
            admin.hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                msg.sender == address(admin),
            "TokenSale: Onlyadmin"
        );
    }

    /**
     * @dev invest USDB to the tokensale
     */
    function deposit(uint256 _amount) external {
        console.log("kyc enabled", isKYCEnabled);
        if (isKYCEnabled) {
            require(admin.isKYCDone(msg.sender) == true, "KYC not done");
        }
        address sender = msg.sender;
        require(
            !admin.blacklist(address(this), sender),
            "TokenSale: Blacklisted"
        );
        checkingEpoch();

        require(epoch == Epoch.Private, "TokenSale: Incorrect time");
        require(_amount > 0, "TokenSale: 0 deposit");

        if (userDepositIndex[sender] == 0) {
            usersOnDeposit.push(sender);
            userDepositIndex[sender] = usersOnDeposit.length;
        }
        if (epoch == Epoch.Private) {
            _processPrivate(sender, _amount);
        }
    }

    function destroy() external override {
        _onlyAdmin();
        if(isRaiseClaimed) takeUSDBRaised();
        uint256 amountUSDB = USDB.balanceOf(address(this));
        if (amountUSDB > 0) {
            USDB.safeTransfer(admin.wallet(), amountUSDB);
        }
        address payable wallet = payable(admin.wallet());
        selfdestruct(wallet);
    }

    /**
     * @notice withdraw accidently sent ERC20 tokens
     * @param _tokenAddress address of token to withdraw
     */
    function removeOtherERC20Tokens(address _tokenAddress) external {
        _onlyAdmin();
        address pair = factory.getPair(address(USDB),params.tokenAddress);
        require(
            _tokenAddress != address(USDB) && _tokenAddress != pair,
            "TokenSale: Can't withdraw USDB"
        );
        uint256 balance = IERC20D(_tokenAddress).balanceOf(address(this));
        IERC20D(_tokenAddress).safeTransfer(admin.wallet(), balance);

        emit ERC20TokensRemoved(_tokenAddress, msg.sender, balance);
    }

    /**
     * @dev processing USDB investment
     * @param _sender - transaction sender
     * @param _amount - investment amount in USDB
     */
    function _processPrivate(address _sender, uint256 _amount) internal {
        require(_amount > 0, "TokenSale: Too small");

        Staked storage s = stakes[_sender];
        uint256 amount = _amount;
        uint256 sum = s.amount + amount;

        uint256 maxAllocationOfUser = tokensaleTiers[_sender] == 0 ? params.baseLine : tokensaleTiers[_sender];
        require(sum <= maxAllocationOfUser, "upto max allocation");

        s.amount += uint128(amount);
        state.totalSold += uint128(amount);
        USDB.safeTransferFrom(_sender, address(this), amount);

        /**@notice Forbid unstaking*/
        emit DepositPrivate(_sender, _amount, address(this));
    }
   
    function takeUSDBRaised() public override {
        _onlyAdmin();
        checkingEpoch();
        require(epoch == Epoch.Finished, "TokenSale: Not time yet");
        require(!isRaiseClaimed, "TokenSale: Already paid");

        uint256 earned;

        if (state.totalSold > state.totalSupplyInValue) {
            earned = uint256(state.totalSupplyInValue);
        } else {
            earned = uint256(state.totalSold);
        }

        isRaiseClaimed = true;

        if (earned > 0) {
            uint256 bal = USDB.balanceOf(address(this));
            uint256 returnValue = earned <= bal ? earned : bal;
            uint earning = (returnValue * (POINT_BASE - platformTax))/POINT_BASE;
            USDB.safeTransfer(creator, earning);
            USDB.safeTransfer(admin.wallet(), returnValue - earning);
        }
        if(params.burnUnsold){
            IERC20D(params.tokenAddress).safeTransfer(address(0), IERC20D(params.tokenAddress).balanceOf(address(this)));
        }else{
            IERC20D(params.tokenAddress).safeTransfer(creator, IERC20D(params.tokenAddress).balanceOf(address(this)));
        }

        emit RaiseClaimed(creator, earned);
    }

    function _addLiq() internal {
        uint USDBAmount = state.totalSold > state.totalSupplyInValue ?
            state.totalSupplyInValue : state.totalSold;
        USDBAmount = (USDBAmount * (params.liqudityPercentage))/POINT_BASE;
        // uint decimalDiffrence = IERC20D(USDB).decimals() - IERC20D(params.tokenAddress).decimals();
        // uint tokenAmount = decimalDiffrence == 0 ?
        //     (params.liqudityPercentage * USDBAmount / 10000) :
        //     (params.liqudityPercentage * USDBAmount / (10000 * 10 ** decimalDiffrence));
        uint tokenAmount = state.totalSold > state.totalSupplyInValue ? params.tokenLiquidity : 
            params.tokenLiquidity * state.totalSold / state.totalSupplyInValue;
            
        IERC20D(USDB).approve(address(router), USDBAmount);    
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
    }

    function claimLP() external {
        require(block.timestamp >= lockinPeriod + params.LPLockin, "Lockin period is not over yet");
        address pair = factory.getPair(address(USDB),params.tokenAddress);
        uint256 liquidity = IERC20D(pair).balanceOf(msg.sender);
        if (liquidity > 0){
           IERC20D(pair).transfer(msg.sender,liquidity);
        }
    }
    
    function claim() external {
        checkingEpoch();
        require(block.timestamp >= lockinPeriod + params.vestingPeriod, "vesting period is not over yet");
        require(
            uint8(epoch) > 1 && !admin.blockClaim(address(this)),
            "TokenSale: Not time or not allowed"
        );

        Staked storage s = stakes[msg.sender];
        require(s.amount != 0, "TokenSale: No Deposit");
        require(!s.claimed, "TokenSale: Already Claimed");

        uint256 left;
        (s.share, left) = _claim(s);
        if(left > 0){
            USDB.safeTransfer(msg.sender, left);
        }
        if(s.share > 0){
            uint decimalDiffrence = IERC20D(USDB).decimals() - IERC20D(params.tokenAddress).decimals();
            if(decimalDiffrence == 0){
                IERC20D(params.tokenAddress).safeTransfer(msg.sender, s.share);
            }else{
                IERC20D(params.tokenAddress).safeTransfer(msg.sender, s.share / (10 ** decimalDiffrence));
            }
        }
        s.claimed = true;
        emit Claim(msg.sender, left);
    }

    function _claim(Staked memory _s) internal view returns (uint120, uint256) {
        uint256 left;
        if (state.totalSold > (state.totalSupplyInValue)) {
            uint256 rate = (state.totalSupplyInValue * PCT_BASE) /
                state.totalSold;
            _s.share = uint120((uint256(_s.amount) * rate) / PCT_BASE);
            left = uint256(_s.amount) - uint256(_s.share);
        } else {
            _s.share = uint120(_s.amount);
        }

        return (_s.share, left);
    }

    function canClaim(address _user) external view returns (uint120, uint256) {
        return _claim(stakes[_user]);
    }

    /**
     * @dev sends Locked USDB to admin wallet
     */

    function takeLocked() external override {
        _onlyAdmin();
        require(
            block.timestamp >= (params.saleEnd + 2592e3),
            "TokenSale: Not ended"
        );
        uint256 amountUSDB = USDB.balanceOf(address(this));
        if (amountUSDB > 0) {
            USDB.safeTransfer(admin.wallet(), amountUSDB);
        }
    }

    /**
    @dev Total Tokens (in $) sold in IDO
     */
    function totalTokenSold() external view returns (uint128) {
        return state.totalSold;
    }
}