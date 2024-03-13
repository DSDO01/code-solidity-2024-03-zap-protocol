// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IERC20D.sol";


contract Faucet {
   IERC20D public EBSC;
   IERC20D public BUSD;

   address public owner;

   modifier onlyOwner() {
       require(msg.sender == owner);
       _;
   }

    constructor(address ebsc_, address busd_){
        EBSC = IERC20D(ebsc_);
        BUSD = IERC20D(busd_);
        owner = msg.sender;
    }

    function mintEBSC(address _address, uint256 _amount) external{
        require(_amount < (1000000 * (10 ** (EBSC.decimals()))), "amount less than 10 million");
        EBSC.transfer( _address, _amount);
    }

    function mintBUSD(address _address, uint256 _amount) external{
        require(_amount < (1000000 * (10 ** (BUSD.decimals()))), "amount less than 10 million");
        BUSD.transfer(_address, _amount);
    }

    function setBUSD(IERC20D busd_) external onlyOwner {
        BUSD = busd_;
    }

    function setEBSC(IERC20D ebsc_) external onlyOwner {
        EBSC = ebsc_;
    }

    // function viewEBSCBalance() external returns(uint256){
    //     return EBSC.balanceOf(address(this));
    // }
}