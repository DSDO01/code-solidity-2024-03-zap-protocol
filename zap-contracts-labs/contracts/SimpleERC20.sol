// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleERC20 is ERC20 {
    uint8 private immutable tokenDecimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _owner
    ) ERC20(_name, _symbol) {
        tokenDecimals = _decimals;
        _mint(_owner, _initialSupply * 10 ** uint256(_decimals));
    }

    function decimals() public view override returns (uint8) {
        return tokenDecimals;
    }
}
