// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IAdmin.sol";

contract SuperCharge is AccessControl,Initializable{
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct userDetail{
        uint superChargeId;
        bool staked;
    }

    struct superChargeReward{
        uint rewardAmount;
        uint totalStaked;
        mapping(address => bool) isEligible;
        mapping(address => uint) prevAmount;
    }

    IAdmin public admin;
    IERC20 public ION;

    uint public superChargeCount;

    mapping(uint => superChargeReward) public superChargeRewards;

    mapping(address => userDetail) public userDetails;

    event ERC20TokensRemoved(address _tokenAddress, address indexed sender, uint256 balance);
    event ClaimedSuperCharge(address indexed user, uint256 amount); 

    function initialize(address _admin, address _ION) public initializer{
        admin = IAdmin(_admin);
        ION = IERC20(_ION);
    }

    function _onlyAdmin() internal view {
        require(
            admin.hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                msg.sender == address(admin),
            "TokenSale: Onlyadmin"
        );
    }


    function startEpoch() external {
        require(msg.sender == address(ION), "only ION");
        superChargeReward storage newSuperChargeReward = superChargeRewards[++superChargeCount];
        newSuperChargeReward.totalStaked = IStaking(admin.stakingContract()).totalStakedAmount();
    }

    function endEpoch(uint amount) external {
        require(msg.sender == address(ION), "only ION");
        superChargeReward storage newSuperChargeReward = superChargeRewards[superChargeCount];
        newSuperChargeReward.rewardAmount = amount;
    }

    function setUserStateWithDeposit(address user) external{
        require(msg.sender == address(admin.stakingContract()),"Only staking contract can call");
        (,, uint stakedAmount, ) = IStaking(admin.stakingContract()).getUserState(user);
        superChargeReward storage newSuperChargeReward = superChargeRewards[superChargeCount];
        if(!newSuperChargeReward.isEligible[user] && newSuperChargeReward.rewardAmount == 0){
            if(stakedAmount > 0){
                if(newSuperChargeReward.prevAmount[user] == 0){
                    newSuperChargeReward.prevAmount[user] = stakedAmount;
                    userDetails[user] = userDetail(superChargeCount-1,true);
                } 
            }else{
                userDetails[user] = userDetail(superChargeCount,true);
                newSuperChargeReward.isEligible[user] = true;
            }
        }else{
                userDetails[user] = userDetail(superChargeCount,true);
        }
    }

    function setUserStateWithWithdrawal(address user) external{
        require(msg.sender == address(admin.stakingContract()),"Only staking contract can call");
        userDetails[user] = userDetail(superChargeCount,false);
        (,, uint stakedAmount, ) = IStaking(admin.stakingContract()).getUserState(user);
        superChargeReward storage newSuperChargeReward = superChargeRewards[superChargeCount];
        if(!newSuperChargeReward.isEligible[user] && newSuperChargeReward.rewardAmount == 0){
            newSuperChargeReward.isEligible[user] = true;
            newSuperChargeReward.totalStaked -= stakedAmount;
        }
    }

    function userRewards(address user, uint stakedAmount) public view returns(uint amount, uint end){
        if(userDetails[user].staked && userDetails[user].superChargeId < superChargeCount){
            end = (superChargeCount - userDetails[user].superChargeId) > 150 ? 
                        userDetails[user].superChargeId + 150 : superChargeRewards[superChargeCount].rewardAmount == 0 ? superChargeCount - 1 : superChargeCount;
            for(uint i = userDetails[user].superChargeId+1; i <= end; i++){ 
                uint staked = superChargeRewards[i].isEligible[user] ? 0 : superChargeRewards[i].prevAmount[user] != 0 ? superChargeRewards[i].prevAmount[user] : stakedAmount;
                if(staked != 0){
                    amount += (superChargeRewards[i].rewardAmount * staked)/superChargeRewards[i].totalStaked;
                }
            }  
        }else{
            return (0,0);
        }
    }

    function claimSuperCharge(address user) external{
        (,, uint stakedAmount, ) = IStaking(admin.stakingContract()).getUserState(user);
        require(canClaim(user,stakedAmount),"noting to claim");
        (uint amount, uint end) = userRewards(user,stakedAmount);
        userDetails[user] = userDetail(end,true);
        ION.transfer(user, amount);
        emit ClaimedSuperCharge(msg.sender, amount);
    }

    function removeOtherERC20Tokens(address _tokenAddress) external {
        _onlyAdmin();
        uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).safeTransfer(admin.wallet(), balance);

        emit ERC20TokensRemoved(_tokenAddress, msg.sender, balance);
    }

    function canClaim(address user, uint stakedAmount) view public returns(bool){
        (uint amount, ) = userRewards(user, stakedAmount);
        return( amount == 0 ? false : true);
    }

    function setION(address _ION) external  {
        _onlyAdmin();
        ION = IERC20(_ION);
    }

    function setAdmin(address _admin) public {
        _onlyAdmin();
        admin = IAdmin(_admin);
    }

    function setCycleRewards(uint256 _cycle, uint256 _rewards) external {
        _onlyAdmin();
        superChargeRewards[_cycle].rewardAmount = _rewards;
    }
    
    function isEligibleForCycle(address user) public view returns(bool){
        return(!superChargeRewards[superChargeCount].isEligible[user]);
    }

    function userPendingForCycle(address user) public view returns(uint){
        return(superChargeRewards[superChargeCount].prevAmount[user]);
    }

}