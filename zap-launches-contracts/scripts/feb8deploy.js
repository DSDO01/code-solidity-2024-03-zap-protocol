const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const { ownersAddress, WETHAddress, TokenA, UniswapRouter, PancakeFactory, PancakeRouter } = require("../constant");
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {

///USDB Deploy and Attach
  TokenA = await ethers.getContractFactory("TokenA");
  // TokenA = await TokenA.deploy();
  // // WETH = await TokenA.attach("0xA9F81589Cc48Ff000166Bf03B3804A0d8Cec8114");
  // console.log("TokenA: ", TokenA.address);
  // sleep(5000);

/////USDB Deploy and Attach
// USDB = await ethers.getContractFactory("USDB");
// // USDB = await USDB.deploy();
//   WETH = await USDB.attach("0xA9F81589Cc48Ff000166Bf03B3804A0d8Cec8114");
//   console.log("USDB: ", USDB.address);
//   console.log(`USDB Deployed to: ${USDB.target}`);
//   sleep(5000);

// /////////TokenSaleUSDB Deploy and Attach///////////////
  tokenSaleUSDB = await ethers.getContractFactory("TokenSaleUSDB");
  tokenSaleUSDB = await tokenSaleUSDB.deploy();
//   const tokenSaleUSDB = await tokenSaleUSDB.attach(tokenSaleUSDB);
  console.log("tokenSaleUSDB:==> ", tokenSaleUSDB.address);
  sleep(5000);

// /////////TokenSaleETH Deploy and Attach///////////////
tokenSaleETH = await ethers.getContractFactory("TokenSaleETH");
tokenSaleETH = await tokenSaleETH.deploy();
//   const tokenSaleETH = await tokenSaleETH.attach(tokenSaleETH);
console.log("tokenSaleETH:==> ", tokenSaleETH.address);
sleep(5000);

///////Admin Deploy and Attach///////////////
//   Admin = await ethers.getContractFactory("Admin");
//   Admin = await Admin.deploy();
// //   const Admin = await Admin.attach(Admin);
//   console.log("Admin:==> ", Admin.address);
//   sleep(5000);

 //-------------------------------------------------------/////


}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});