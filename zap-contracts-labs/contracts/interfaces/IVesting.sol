// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVesting is IAccessControl {
    function initialize(
        address operator,
        address _tokenSale,
        IERC20 _token,
        address _distributionWallet,
        uint128[2][] memory _vestingPoints
    ) external;

    function getVestingPoints() external returns (uint128[2][] memory);
}
