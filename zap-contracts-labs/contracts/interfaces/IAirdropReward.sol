// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

interface IAirdropReward {
    function wallet() external view returns (address);

    function multisig() external view returns (address);

    function setWallet(address) external;

    function setMultisig(address) external;

    function addOperator(address) external;

    function addAirdrop(
        address token,
        string calldata _URL,
        string calldata _fromDetail,
        address[] calldata users,
        uint256[] calldata amounts
    ) external payable;

    function getAirdropsOfUser(address _user) external view returns (uint256[] memory);

    function getUserAmountForAirdrop(uint256 id, address _user)
        external
        view
        returns (uint256);

}
