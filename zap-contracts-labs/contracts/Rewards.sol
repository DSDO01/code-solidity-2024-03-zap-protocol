// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IAirdrops.sol";
import "./libraries/airdropLib.sol";

import "./mock_router/interfaces/IUniswapV2Factory.sol";
import "./mock_router/interfaces/IUniswapV2Router02.sol";
import "./mock_router/interfaces/IUniswapV2Pair.sol";

contract Rewards is Initializable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    bytes32 public constant STAKING = keccak256("STAKING");
    bytes32 public constant IONS = keccak256("IONS");
    IUniswapV2Router02 public  uniswapV2Router;

    IAdmin public admin;
    IERC20 public ION;
    address public devWallet;

    uint256 public SMatic;
    uint256 public totalStakeMatic;
    uint256 public totalMatic;
    uint256 public valueNotDistribute;
    uint256 public maticStakeHolder;

    uint256 public SION;
    uint256 public totalStakeION;
    uint256 public pendingION;
    uint256 public IONStakeHolder;
    uint256 public maticStakerPer;
    uint256 public constant PCT_BASE = 1000;

    bool firstDistribution;

    mapping(address => uint256) public s1Matic;
    mapping(address => uint256) public previousRewardMatic;

    mapping(address => uint256) public s1ION;
    mapping(address => uint256) public previousRewardION;

    event ClaimedReward(bool isIONReward, address receiver, uint256 amount);

    /**
     ** @dev Initialize Function
     ** @param _admin: Admin Contract
     ** @param _ION: ION contract
     */
    function initialize(
        address _admin,
        address _ION,
        address _router,
        address _devWallet
    ) public initializer {
        admin = IAdmin(_admin);
        ION = IERC20(_ION);
        IONStakeHolder = 1;
        maticStakeHolder = 7;
        maticStakerPer = 800;
        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(_router);
        uniswapV2Router = _uniswapV2Router;
        devWallet = _devWallet;
    }

    receive() external payable {}

    /**
    @dev set maticStakeHolders users 
    @param _tier Tier eligible for Matic reward
     */
    function setMaticStakeHolders(uint256 _tier) external onlyOperator {
        maticStakeHolder = _tier;
    }

    /**
    @dev set IONStakeHolders users 
    @param _level Lock Level eligible for ION reward
     */
    function setIONStakeHolders(uint256 _level) external onlyOperator {
        IONStakeHolder = _level;
    }

    function setMaticStakerPer(uint256 _value) external onlyOperator{
        maticStakerPer = _value;
    }

    function setDevWallet(address _newAddress) external onlyOperator {
        devWallet = _newAddress;
    }

    /**
     * @dev returns balance of the contract
     */
    function viewBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
    @dev Users can withdraw ION
    @param user user address
    @param _amount Withdraw amount 
     */
    function withdrawION(address user, uint256 _amount) public onlyStaking {
        totalStakeION = totalStakeION.sub(
            _amount,
            "totalstakedION - amount fail"
        );
        s1ION[user] = SION;
    }

    /**
    @dev Distribute ION tokens  
    @param amount Amount to be distributed 
     */
    function distributionION(uint256 amount) public  {
        require(msg.sender == address(ION), "only ION");
        if (amount != 0 && totalStakeION != 0) {
            SION += ((amount * 10**18) / totalStakeION);
        }
    }

    /**    
    @dev set Share for ION Reward
    @param user User address
    @param _prevLock Previous Lock time
    @param _amount Amount staked
     */
    function setShareForIONReward(
        address user,
        uint256 _prevLock,
        uint256 _amount
    ) public onlyStaking {
        uint256 lock;
        uint256 amount;
        (, lock, amount, ) = IStaking(admin.stakingContract()).getUserState(user);
        if (_prevLock == 2) {
            totalStakeION -= _amount;
        } else if (_prevLock == 3) {
            totalStakeION -= (_amount * 15) / 10;
        } else if (_prevLock == 4) {
            totalStakeION -= (_amount * 30) / 10;
        }
        if (lock == 3) {
            amount = (amount * 15) / 10;
        } else if (lock == 4) {
            amount = (amount * 30) / 10;
        }
        totalStakeION += amount;
        s1ION[user] = SION;
    }

    /**
    @dev Calculates Pending ION reward
    @param user User address
     */
    function userPendingION(address user) public onlyStaking {
        uint256 amount;
        uint256 lock;
        (, lock, amount, ) = IStaking(admin.stakingContract()).getUserState(user);
        if (lock == 3) {
            amount = (amount * 15) / 10;
        } else if (lock == 4) {
            amount = (amount * 30) / 10;
        }
        previousRewardION[user] += (amount * (SION - s1ION[user])) / 10**18;
        s1ION[user] = SION;
    }

    /**
    @dev return ION reward of the user
    @param user user address
    @param amount amount staked     
    @param lock lock level
     */
    function getIONReward(
        address user,
        uint256 amount,
        uint256 lock
    ) public view returns (uint256) {
        if (lock <= IONStakeHolder) {
            return (previousRewardION[user]);
        } else {
            if (lock == 3) {
                amount = (amount * 15) / 10;
            } else if (lock == 4) {
                amount = (amount * 30) / 10;
            }
            return (previousRewardION[user] +
                (amount * (SION - s1ION[user])) /
                10**18);
        }
    }

    /**
     * @dev user will claimION
     */
    function claimION() public {
        (,uint lock,uint amount, ) = IStaking(admin.stakingContract()).getUserState(msg.sender);
        uint reward = getIONReward(msg.sender, amount, lock);
        previousRewardION[msg.sender] = 0;
        s1ION[msg.sender] = SION;
        require(reward > 0, "Nothing");
        ION.safeTransfer(msg.sender, reward);
        emit ClaimedReward(true, msg.sender, reward);
    }

    /**
     @dev Set Total Matic for reward distribution
     */
    function setTotalMatic(uint256 _amount) public onlyStaking {
        valueNotDistribute += _amount;
    }

    /**
    @dev Set Matic Share for users
    @param user User address
    @param _amount Amount Staked
     */
    function setShareForMaticReward(address user, uint256 _amount)
        public
        onlyStaking
    {
        totalStakeMatic += _amount;
        s1Matic[user] = SMatic;
    }

    /**
    @dev Distributes Matic rewards, buy back tokens
     */
    function distributionMatic() public  {
        require(msg.sender == address(ION), "only ION");
        if (totalStakeMatic != 0 && valueNotDistribute != 0) {
            uint256 eightyPerMatic = (maticStakerPer * valueNotDistribute)/ PCT_BASE;
            uint256 buyBackMatic = valueNotDistribute - eightyPerMatic;
            //buy back
            address[] memory path = new address[](2);
            path[0] = uniswapV2Router.WETH();
            path[1] = address(ION);
            uniswapV2Router.swapExactETHForTokensSupportingFeeOnTransferTokens{value:buyBackMatic}(0, path, devWallet, block.timestamp+ 3600);
            SMatic += ((eightyPerMatic) * 10**18) / totalStakeMatic;
            totalMatic += eightyPerMatic;
            valueNotDistribute = 0;
        }
    }

    /**
    @dev Set pendingMatic of the user
    @param user user address 
    @param amount amount staked 
     */
    function userPendingMatic(address user, uint256 amount) public onlyStaking {
        previousRewardMatic[user] += (amount * (SMatic - s1Matic[user])) / 10**18;
    }

    /**
     @dev return Matic rewards of the user
     @param user address of the user
     @param amount Amount staked
     @param _tier Tier 
     */
    function getMaticReward(
        address user,
        uint256 amount,
        uint256 _tier
    ) public view returns (uint256) {
        if (uint8(_tier) < maticStakeHolder) {
            return (previousRewardMatic[user]);
        } else {
            return (previousRewardMatic[user] +
                (amount * (SMatic - s1Matic[user])) /
                10**18);
        }
    }

    /**
     @dev Claim Matic reward
     */
    function claimMatic() public {
        uint256 amount;
        uint256 lock;
        uint256 reward;
        uint256 tier;
        (tier, lock, amount, ) = IStaking(admin.stakingContract()).getUserState(msg.sender);
        reward = getMaticReward(msg.sender, amount, tier);
        require(reward != 0, "Nothing to claim");
        previousRewardMatic[msg.sender] = 0;
        totalMatic = totalMatic.sub(reward, "totalMatic - reward fail");
        s1Matic[msg.sender] = SMatic;
        (bool sent, ) = payable(msg.sender).call{value: reward}("");
        require(sent, "Failed to send Matic");
        emit ClaimedReward(false, msg.sender, reward);
    }

    modifier onlyOperator() {
        require(
            admin.hasRole(OPERATOR, msg.sender),
            "sender is not an operator"
        );
        _;
    }
    /**
    @dev Only Staking Contract can call
    */
    modifier onlyStaking() {
        require(admin.hasRole(STAKING, msg.sender), "Only Staking");
        _;
    }


    modifier validation(address _address) {
        require(_address != address(0), "zero address");
        _;
    }

    /**
     @dev set ION address
     @param _address ION address
     */
    function setION(address _address)
        external
        validation(_address)
        onlyOperator
    {
        ION = IERC20(_address);
    }

    function setS(uint256 _value, uint256 _extraRewards) external onlyOperator {
        if (_extraRewards == 0) {
            SION = _value;
        } else {
            SION -= ((_extraRewards * 10**18) / totalStakeION);
        }
    }

    function setSUser(address _user, uint256 _value) external onlyOperator {
        s1ION[_user] = _value;
    }

    /**
     * @dev Set Admin contract
     */
    function setAdmin(address _address)
        external
        validation(_address)
        onlyOperator
    {
        admin = IAdmin(_address);
    }

    function removeOtherERC20Tokens(address _token) external onlyOperator {
        uint256 bal = IERC20(_token).balanceOf(address(this));

        if (bal > 0) {
            IERC20(_token).transfer(admin.wallet(), bal);
        }
    }

    function removeMatic() external onlyOperator {
        uint256 bal = address(this).balance;

        if (bal > 0) {
            payable(admin.wallet()).transfer(bal);
        }
    }
}
