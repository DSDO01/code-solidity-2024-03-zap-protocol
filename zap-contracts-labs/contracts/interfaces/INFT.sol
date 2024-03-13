// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

/**
 * @title IStaking.
 * @dev interface for staking
 * with params enum and functions.
 */
interface INFT {
  
    function mint(address account, uint256 id, uint256 amount, bytes memory data) external;

}
