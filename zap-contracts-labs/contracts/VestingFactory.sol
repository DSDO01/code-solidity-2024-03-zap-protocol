// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IVesting.sol";

contract VestingFactory is AccessControl {
    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    address public masterVesting;

    event VestingCreated(address tokenSale, address vestingContract);

    constructor(address _masterVesting) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(OPERATOR, DEFAULT_ADMIN_ROLE);
        masterVesting = _masterVesting;
    }

    function createVestingSchedule(
        address _tokenSale,
        IERC20 _token,
        address _distributionWallet,
        uint128[2][] memory _vestingPoints
    ) external onlyRole(OPERATOR) {
        address instance = Clones.clone(masterVesting);
        require(
            instance != address(0),
            "VestingFactory: Vesting contract not deployed"
        );
        IVesting(instance).initialize(
            msg.sender,
            _tokenSale,
            _token,
            _distributionWallet,
            _vestingPoints
        );
        emit VestingCreated(_tokenSale, instance);
    }

    function setMasterVesting(
        address _masterVesting
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        masterVesting = _masterVesting;
    }

    function setOperator(
        address _operator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setupRole(OPERATOR, _operator);
    }
}
