// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IAirdrops.sol";
import "./interfaces/ISuperCharge.sol";
import "./libraries/StakingLibrary.sol";



/**
 * @title Staking.
 * @dev contract for staking tokens.
 *
 */

contract Staking is IStaking, Initializable {
    using SafeERC20 for IERC20;
    using StakingLibrary for StakingLibrary.TierDetails;
    using StakingLibrary for StakingLibrary.LevelDetails;
    using StakingLibrary for StakingLibrary.UserState;


    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    uint128 constant POINT_BASE = 1000;
    uint128 constant NO_LOCK_FEE = 50; //5%

    uint256 public MaticFeeLockLevel;
    bool public noLock;

    uint256 public lockLevelCount;
    uint256 public totalStakedAmount;
    IERC20 public ION;
    IAdmin public admin;
    IUniswapV2Router02 public router;
    address public wMatic;

    mapping(uint256 => mapping(uint256 => StakingLibrary.TierDetails))
        public tiers;
    mapping(uint256 => StakingLibrary.LevelDetails) public levels;
    mapping(address => StakingLibrary.UserState) public stateOfUser;

    /**
     @dev Initialize Function
     @param _token: Token Contract
     @param _admin: Admin Contract
     @param _router: Router contract
     @param _wMatic: wMatic contract
     @param _depositAmount[][] : ION amount required for different levels & tiers
     */
    function initialize(
        address _token,
        address _admin,
        address _router,
        address _wMatic,
        uint128[][] memory _depositAmount
    ) public initializer {
        ION = IERC20(_token);
        admin = IAdmin(_admin);
        lockLevelCount = 4;
        levels[1] = StakingLibrary.LevelDetails(0, 6);
        levels[2] = StakingLibrary.LevelDetails(30 days, 6);
        levels[3] = StakingLibrary.LevelDetails(60 days, 6);
        levels[4] = StakingLibrary.LevelDetails(90 days, 7);

        router = IUniswapV2Router02(_router);
        wMatic = _wMatic;
        MaticFeeLockLevel = 1;

        for (uint8 i = 0; i < uint8(_depositAmount.length); i++) {
            for (uint8 j = 0; j < uint8(_depositAmount[i].length); j++) {
                tiers[i + 1][j + 1].amount = uint128(_depositAmount[i][j] * 10** 18); 
            }
        }
    }

    receive() external payable {}

    /**
    @dev Checks IDO instance
    */
    modifier onlyInstances() {
        require(admin.tokenSalesM(msg.sender), "Staking: Not Instance");
        _;
    }
    modifier validation(address _address) {
        require(_address != address(0), "Staking: zero address");
        _;
    }
    modifier onlyOperator() {
        require(admin.hasRole(OPERATOR, msg.sender), "Staking: Not Operator");
        _;
    }

    modifier onlyAdmin() {
        require(
            admin.hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Staking: Not Admin"
        );
        _;
    }

    /**
     @dev Set admin contract
     @param _address admin contract address
     */
    function setAdmin(address _address)
        external
        validation(_address)
        onlyOperator
    {
        admin = IAdmin(_address);
    }

    /**
     @dev Set Token contract
     @param _address Token contract address
     */
    function setToken(address _address)
        external
        validation(_address)
        onlyOperator
    {
        ION = IERC20(_address);
    }

    /**
     @dev Set tier
     @param _address user address
     @param _tier Tier
     */
    
    function setTierTo(address _address, uint256 _tier)
        external
        override
        onlyOperator
    {
        stateOfUser[_address].Tier = uint32(_tier);
    }

    /**
     @dev get alllocation of user
     @param _address user address
     */
    function getAllocationOf(address _address)
        external
        view
        override
        returns (uint128)
    {
        StakingLibrary.UserState memory state = stateOfUser[_address];
        return (
            tiers[uint256(state.lock)][_getHighestTier(_address)].allocations
        );
    }

    /**
     @dev Sets IDO pool end time
     @param _address IDO address
     @param _time Time in seconds
     */
    function setPoolsEndTime(address _address, uint256 _time)
        external
        override
        onlyInstances
    {
        if (stateOfUser[_address].lockTime < _time) {
            stateOfUser[_address].lockTime = uint64(_time);
        }
    }

    /**
     @dev Staking
     @param _level lock level 
     @param _amount amount
     */
    function stake(uint256 _level, uint256 _amount) external payable {
        // require(_amount>_depositAmount,"Low");
        uint256 _duration = (block.timestamp +
            uint256(levels[_level].duration));
        StakingLibrary.UserState storage s = stateOfUser[msg.sender];

        uint256 prevLock = s.lock;
        uint256 prevTier = _getHighestTier(msg.sender);
        uint256 prevAmount = s.amount;
        if (prevLock > 1) {
            IAirdrops(admin.airdrop()).userPendingION(msg.sender);
        }
        ISuperCharge superCharge = ISuperCharge(admin.superCharge());
        (uint id,bool flag) = superCharge.userDetails(msg.sender);
        if(id == 0 && !flag){
            superCharge.setUserStateWithDeposit(msg.sender);
        }else if(_superChargeReward(msg.sender)){
            superCharge.setUserStateWithDeposit(msg.sender);
        }

        if (_amount == 0) {
            require(s.amount != 0, "Staking: Amount > 0");
            require(_level > s.lock, "Staking: Invalid lock level");
            s._updateUserState(_amount, _level, _duration);

            if (s.lock > 1) {
                IAirdrops(admin.airdrop()).setShareForIONReward(
                    msg.sender,
                    prevLock,
                    s.amount
                );
            }
            return;
        }

        require(uint8(_level) >= uint8(s.lock), "Staking: level < user level");

        totalStakedAmount += (_amount);

        s._updateUserState(_amount, _level, _duration);

        uint256 highestTier = _getHighestTier(msg.sender);
        require(highestTier > 0, "Staking: No Tier");
        s.Tier = uint32(highestTier);

        if (s.lock == 4 && highestTier == 7) {
            if (prevLock != 4 || prevTier != 7) {
                IAirdrops(admin.airdrop()).setShareForMaticReward(
                    msg.sender,
                    s.amount
                );
            } else if (prevLock == 4 && prevTier == 7) {
                IAirdrops(admin.airdrop()).setShareForMaticReward(
                    msg.sender,
                    _amount
                );
            }
        }

        if (s.lock > 1) {
            if (prevLock <= 1) {
                IAirdrops(admin.airdrop()).setShareForIONReward(
                    msg.sender,
                    prevLock,
                    s.amount
                );
            } else {
                IAirdrops(admin.airdrop()).setShareForIONReward(
                    msg.sender,
                    prevLock,
                    prevAmount
                );
            }
        }

        if (s.lock == MaticFeeLockLevel) {
            _takeMaticFee(_amount, msg.value);
        }

        ION.safeTransferFrom(msg.sender, address(this), _amount);

    emit UserStakeDetails(msg.sender, _level, _amount,_duration, block.timestamp);
    }

    /**
     @dev Unstaking total staked
     */
    function unstake() external override {
        require(_canUnstake(), "Staking: Not time");
        StakingLibrary.UserState storage s = stateOfUser[msg.sender];
        uint256 amount = s.amount;

        uint256 prevTier = _getHighestTier(msg.sender);

        if (s.lock > 1) {
            IAirdrops(admin.airdrop()).userPendingION(msg.sender);
            IAirdrops(admin.airdrop()).withdrawION(msg.sender, amount);
        }

        ISuperCharge superCharge = ISuperCharge(admin.superCharge());
        if(_superChargeReward(msg.sender)){
            superCharge.setUserStateWithWithdrawal(msg.sender);
        }

        s.amount = 0;
        totalStakedAmount -= amount;

        s.Tier = 0;

        if (s.lock == 4 && prevTier == 7) {
            IAirdrops(admin.airdrop()).userPendingMatic(msg.sender, amount);
        }

        s.lock = 0;


        ION.safeTransfer(msg.sender, amount);
        emit UserUnstakeDetails(msg.sender, amount, block.timestamp);
    }

    /**
     @dev Set $ allocations
     */
    function setAllocations(uint128[][] memory _allocations)
        external
        onlyOperator
    {
        for (uint8 i = 0; i < uint8(_allocations.length); i++) {
            for (uint8 j = 0; j < uint8(_allocations[i].length); j++) {
                require(_allocations[i][j] > 0, "Staking: price > 0");
                tiers[i + 1][j + 1].allocations = _allocations[i][j];
            }
        }
    }

    /**
     @dev Set Matic tx fee level
     @param _level Lock level
     */
    function setMaticFeeLockLevel(uint256 _level) external onlyOperator {
        require(_level <= lockLevelCount, "Staking: Invalid lock level");
        MaticFeeLockLevel = _level;
    }

    /**
     @dev Removes the lock period on all staked users
     @param _noLock bool
     */
    function setNoLock(bool _noLock) external onlyAdmin {
        noLock = _noLock;
    }

    /**
     @dev Change allocations
     @param _level lock level 
     @param _tier Tier
     @param _allocation new allocation
     */
    function changeAllocations(
        uint256 _level,
        uint256 _tier,
        uint128 _allocation
    ) external onlyOperator {
        require(_allocation > 0, "Staking: price > 0");
        tiers[_level][_tier].allocations = _allocation;
    }

    /**
    @dev Set staking deposit amount
    @param _depositAmount array of amounts
    */
    function setDeposits(uint128[][] memory _depositAmount)
        public
        onlyOperator
    {
        for (uint8 i = 0; i < uint8(_depositAmount.length); i++) {
            for (uint8 j = 0; j < uint8(_depositAmount[i].length); j++) {
                tiers[i + 1][j + 1].amount = _depositAmount[i][j] * 10 ** 18;
            }
        }
    }

    /**
     @dev Returns allocation
     @param _level Level
     @param _tier Tier
     */
    function getAllocations(uint256 _level, uint256 _tier)
        external
        view
        returns (uint128)
    {
        return tiers[_level][_tier].allocations;
    }

    /**
     @dev Returns deposit amount
     @param _level Level
     @param _tier Tier
     */
    function getDeposits(uint256 _level, uint256 _tier)
        external
        view
        returns (uint128)
    {
        return tiers[_level][_tier].amount;
    }

    /**
     **@dev Returns user tier,lock,amount and locktime
     */
    function getUserState(address _address)
        external
        view
        override
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            _getHighestTier(_address),
            uint256(stateOfUser[_address].lock),
            uint256(stateOfUser[_address].amount),
            uint256(stateOfUser[_address].lockTime)
        );
    }

    /**
    @dev Calculates staking fee for no lock
     */
    function _takeMaticFee(uint256 _amount, uint256 _maticValue) internal {
        uint256 feePercent = (_amount * NO_LOCK_FEE) / POINT_BASE;
        address[] memory arr = new address[](2);
        arr[0] = address(ION);
        arr[1] = wMatic;
        uint256[] memory v;
        v = router.getAmountsOut(feePercent, arr);
        uint256 valueInMatic = v[v.length - 1];
        require(_maticValue >= valueInMatic, "Staking: Invalid Matic");
        address payable airdrop = payable(admin.airdrop());
        IAirdrops(admin.airdrop()).setTotalMatic(_maticValue);
        (bool sent, ) = airdrop.call{value: _maticValue}("");
        require(sent, "Staking: Matic Transfer_Failed");
    }

      function getTierOf(address _address)
        external
        view
        override
        returns (uint256)
    {
        return _getHighestTier(_address);
    }

    /**
    @dev returns highest tier of user
     */
    function _getHighestTier(address _address) internal view returns (uint256) {
        uint256 _tier = _tierByAmount(
            uint256(stateOfUser[_address].amount),
            uint256(stateOfUser[_address].lock)
        );
        return _tier;
    }

    /**
    @dev checks epoch for unstaking
     */
    function _canUnstake() internal view returns (bool) {
        if (noLock) {
            return (true);
        } else {
            return block.timestamp > uint256(stateOfUser[msg.sender].lockTime);
        }
    }

    /**
    @dev returns tier 
     */
    function _tierByAmount(uint256 _amount, uint256 _level)
        internal
        view
        returns (uint256)
    {
        if (_level == 0) {
            return 0;
        }
        for (uint256 i = levels[_level].numberOfTiers; i > 0; i--) {
            if (_amount >= tiers[_level][i].amount) {
                return i;
            }
        }
        return 0;
    }

    function _superChargeReward(address user) internal returns(bool){
        ISuperCharge superCharge = ISuperCharge(admin.superCharge()); 
        if(superCharge.canClaim(user,stateOfUser[msg.sender].amount)){
            superCharge.claimSuperCharge(user);
            require(!(superCharge.canClaim(user,stateOfUser[msg.sender].amount)),"Need to claim superCharge");
            return true;
        }else{
            return true;
        }
    }
}
