// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./interfaces/ITokenSale.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IAirdrops.sol";
import "./interfaces/IERC20D.sol";
import "./interfaces/IStaking.sol";
import "hardhat/console.sol";

/*
A tokensale includes 3 stages: 
1. Private round. Only ion token holders can participate in this round. 
 The Matic/USDC price is fixed in the beginning of the tokensale.
 All tokens available in the pre-sale will be made available through the private sale round. 
 A single investor can purchase up to their maximum allowed investment defined by the tier.
 Investors can claim their tokens only when the private round is finished. 
 If the total supply is higher than the total demand for this tokensale, investors purchase tokens up to their max allocation. 
 If the the demand is higher than supply, the number of tokens investors will receive is adjusted, and then the native token used to invest are partially refunded.

*/

//TODO Change USDC address
//TODO Change Marketing wallet address

contract TokenSale is Initializable, ITokenSale {
    using SafeERC20 for IERC20D;

    uint256 constant PCT_BASE = 10 ** 18;
    uint256 constant POINT_BASE = 1000;
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    address public marketingWallet;

    uint256 public maxAllocation; // in dollar with decimals
    uint256 public globalTaxRate; // base 1000
    uint256 public whitelistTxRate; // base 1000
    bool public isKYCEnabled;

    IStaking stakingContract;
    Params params;
    IERC20D public usdc;
    IAdmin admin;
    /**
     * @dev current tokensale stage (epoch)
     */
    Epoch public override epoch;
    bool isRaiseClaimed;
    bool only;
    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    address[] public usersOnDeposit;

    mapping(address => Staked) public override stakes;
    mapping(address => uint256) public tokensaleTiers;
    /** @dev Decrease result by 1 to access correct position */
    mapping(address => uint256) public userDepositIndex;
    mapping(address => bool) public isWhitelisted;

    State state;

    receive() external payable {}

    function getState() external view returns (uint128, uint128) {
        return (state.totalPrivateSold, state.totalSupplyInValue);
    }

    function initialize(
        Params calldata _params,
        address _stakingContract,
        address _admin,
        uint256 _maxAllocation,
        uint256 _globalTaxRate,
        bool _isKYC,
        uint256 _whitelistTxRate
    ) external initializer {
        params = _params;
        stakingContract = IStaking(_stakingContract);
        admin = IAdmin(_admin);
        state.totalSupplyInValue = uint128(
            (uint256(_params.totalSupply) *
                uint256(_params.privateTokenPrice)) / 10 ** 18
            // removes USDB hardcode of six, awful
        );
        usdc = IERC20D(0xA9F81589Cc48Ff000166Bf03B3804A0d8Cec8114); //TODO change for mainnet
        marketingWallet = 0x6507fFd283c32386B6065EA89744Ade21515e91E; //TODO change for mainnet
        maxAllocation = _maxAllocation;
        globalTaxRate = _globalTaxRate;
        isKYCEnabled = _isKYC;
        whitelistTxRate = _whitelistTxRate;
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

    function whitelistUser(address[] calldata users) public {
        require(admin.hasRole(OPERATOR, msg.sender), "TokenSale: OnlyOperator");
        for (uint256 i = 0; i < users.length; i++) {
            isWhitelisted[users[i]] = true;
        }
    }

    function setAllocationAndTax(uint256[3] calldata _allocations) external {
        require(block.timestamp <= params.privateStart, "Time lapsed");
        require(admin.hasRole(OPERATOR, msg.sender), "TokenSale: OnlyOperator");
        maxAllocation = _allocations[0];
        globalTaxRate = _allocations[1];
        whitelistTxRate = _allocations[2];
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
            time >= params.privateStart &&
            time <= params.privateEnd
        ) {
            epoch = Epoch.Private;
            return;
        }
        if ((epoch != Epoch.Finished && (time > params.privateEnd))) {
            epoch = Epoch.Finished;
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
     * @dev invest usdc to the tokensale
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
        uint256 amountUSDC = usdc.balanceOf(address(this));
        if (amountUSDC > 0) {
            usdc.safeTransfer(admin.wallet(), amountUSDC);
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
        require(
            _tokenAddress != address(usdc),
            "TokenSale: Can't withdraw usdc"
        );
        uint256 balance = IERC20D(_tokenAddress).balanceOf(address(this));
        IERC20D(_tokenAddress).safeTransfer(admin.wallet(), balance);

        emit ERC20TokensRemoved(_tokenAddress, msg.sender, balance);
    }

    /**
     * @dev processing usdc investment to the private round
     * @param _sender - transaction sender
     * @param _amount - investment amount in usdc
     */
    function _processPrivate(address _sender, uint256 _amount) internal {
        require(_amount > 0, "TokenSale: Too small");

        Staked storage s = stakes[_sender];
        uint256 amount = _amount * PCT_BASE;
        uint256 sum = s.amount + amount;

        uint256 maxAllocationOfUser = (calculateMaxAllocation(_sender)) *
            PCT_BASE;
        require(sum <= maxAllocationOfUser, "upto max allocation");
        uint256 taxFreeAllcOfUser = 0; // hardcode zero - all pools have ax

        uint256 userTaxAmount;

        if (sum > taxFreeAllcOfUser) {
            uint256 userTxRate = userTaxRate(sum, _sender);
            if (s.amount < taxFreeAllcOfUser) {
                userTaxAmount =
                    ((sum - taxFreeAllcOfUser) * userTxRate) /
                    POINT_BASE;
            } else {
                userTaxAmount = (amount * userTxRate) / POINT_BASE;
            }
        }

        if (userTaxAmount > 0) {
            s.taxAmount += userTaxAmount;
            usdc.safeTransferFrom(_sender, marketingWallet, userTaxAmount);
        }
        s.amount += uint128(amount);
        state.totalPrivateSold += uint128(amount);
        usdc.safeTransferFrom(_sender, address(this), amount);

        /**@notice Forbid unstaking*/
        // stakingContract.setPoolsEndTime(_sender, uint256(params.privateEnd)); // TODO: uncomment
        emit DepositPrivate(_sender, _amount, address(this));
    }

    /**
     * @dev sends the usdc raise to admin's wallet
     */

    function calculateMaxAllocation(address _sender) public returns (uint256) {
        uint256 userMaxAllc = _maxTierAllc(_sender);

        if (userMaxAllc > maxAllocation) {
            return userMaxAllc;
        } else {
            return maxAllocation;
        }
    }

    function _maxTaxfreeAllocation(address _sender) internal returns (uint256) {
        uint256 userTierAllc = stakingContract.getAllocationOf(_sender);
        uint256 giftedTierAllc = tokensaleTiers[_sender];

        if (userTierAllc > giftedTierAllc) {
            return userTierAllc;
        } else {
            return giftedTierAllc;
        }
    }

    function _maxTierAllc(address _sender) internal returns (uint256) {
        (uint256 userTier, uint256 userLockLvl, , ) = stakingContract
            .getUserState(_sender);

        uint256 giftedTierAllc = tokensaleTiers[_sender];

        if (userTier == 0 && giftedTierAllc == 0) {
            return 0;
        }

        uint256 userTierAllc = stakingContract.getAllocationOf(_sender);
        uint256 nextTierAllc;
        if (userLockLvl > 0 && userLockLvl < 4) {
            nextTierAllc = stakingContract.getAllocations(
                userLockLvl + 1,
                userTier
            );
        } else {
            nextTierAllc = stakingContract.getAllocations(
                userLockLvl,
                userTier + 1
            );
        }

        if (nextTierAllc > userTierAllc) {
            if (nextTierAllc > giftedTierAllc) {
                return nextTierAllc;
            } else {
                return giftedTierAllc;
            }
        } else {
            if (userTierAllc > giftedTierAllc) {
                return userTierAllc;
            } else {
                return giftedTierAllc;
            }
        }
    }

    // _amount should be in dollar without decimals
    function userTaxRate(
        uint256 _amount,
        address _sender
    ) public returns (uint256) {
        uint256 userTaxFreeAllc = 0;

        if (_amount > userTaxFreeAllc) {
            if (isWhitelisted[_sender]) {
                return whitelistTxRate;
            } else {
                return globalTaxRate;
            }
        } else {
            return 0;
        }
    }

    function takeUSDCRaised() external override {
        checkingEpoch();
        require(epoch == Epoch.Finished, "TokenSale: Not time yet");
        require(!isRaiseClaimed, "TokenSale: Already paid");

        uint256 earned;

        if (state.totalPrivateSold > state.totalSupplyInValue) {
            earned = uint256(state.totalSupplyInValue);
        } else {
            earned = uint256(state.totalPrivateSold);
        }

        isRaiseClaimed = true;

        if (earned > 0) {
            uint256 bal = usdc.balanceOf(address(this));
            uint256 returnValue = earned <= bal ? earned : bal;
            usdc.safeTransfer(admin.wallet(), returnValue);
        }

        emit RaiseClaimed(admin.wallet(), earned);
    }

    /**
     * @dev allows the participants of the private round to claim usdc left
     */
    function claim() external {
        checkingEpoch();
        require(
            uint8(epoch) > 1 && !admin.blockClaim(address(this)),
            "TokenSale: Not time or not allowed"
        );

        Staked storage s = stakes[msg.sender];
        require(s.amount != 0, "TokenSale: No Deposit");
        require(!s.claimed, "TokenSale: Already Claimed");

        uint256 left;
        (s.share, left) = _claim(s);
        require(left > 0, "TokenSale: Nothing to claim");
        uint256 refundTaxAmount;
        if (s.taxAmount > 0) {
            uint256 tax = userTaxRate(s.amount, msg.sender);
            uint256 taxFreeAllc = _maxTaxfreeAllocation(msg.sender) * PCT_BASE;
            if (taxFreeAllc >= s.share) {
                refundTaxAmount = s.taxAmount;
            } else {
                refundTaxAmount = (left * tax) / POINT_BASE;
            }
            usdc.safeTransferFrom(marketingWallet, msg.sender, refundTaxAmount);
        }
        s.claimed = true;
        usdc.safeTransfer(msg.sender, left);
        emit Claim(msg.sender, left);
    }

    function _claim(Staked memory _s) internal view returns (uint120, uint256) {
        uint256 left;
        if (state.totalPrivateSold > (state.totalSupplyInValue)) {
            uint256 rate = (state.totalSupplyInValue * PCT_BASE) /
                state.totalPrivateSold;
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
     * @dev sends Locked usdc to admin wallet
     */

    function takeLocked() external override {
        _onlyAdmin();
        require(
            block.timestamp >= (params.privateEnd + 2592e3),
            "TokenSale: Not ended"
        );
        uint256 amountUSDC = usdc.balanceOf(address(this));
        if (amountUSDC > 0) {
            usdc.safeTransfer(admin.wallet(), amountUSDC);
        }
    }

    /**
    @dev Total Tokens (in $) sold in IDO
     */
    function totalTokenSold() external view returns (uint128) {
        return state.totalPrivateSold;
    }
}
