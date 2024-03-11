// SPDX-License-Identifier: UNLICENSED


pragma solidity ^0.8.4;

/**
 * @title IStaking.
 * @dev interface for staking
 * with params enum and functions.
 */
interface IStaking {
    /**
     * @dev
     * defines privelege type of address.
     */

    function setPoolsEndTime(address, uint256) external;

    function setTierTo(address _address, uint _tier) external;

    function stake(uint256 , uint256) external payable;

    function getAllocationOf(address) external returns (uint128);

    function unstake() external;

    function getUserState(address)
        external
        returns (
            uint,
            uint,
            uint256,
            uint256
        );

    function stateOfUser(address)
        external
        returns (
            uint32,
            uint32,
            uint64,
            uint128
        );

    function getTierOf(address) external view returns (uint);
    function setMaticFeeLockLevel(uint) external;
    function totalStakedAmount() external returns(uint);
    function getAllocations(uint256, uint256) external returns(uint128);
    event UserStakeDetails(address indexed user, uint256 level, uint256 amount, uint256 duration, uint256 stakedTime);
    event UserUnstakeDetails(address indexed user, uint256 amount, uint256 unstakedTime);
}
