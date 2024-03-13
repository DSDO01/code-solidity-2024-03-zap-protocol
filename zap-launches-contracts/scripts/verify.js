const hre = require("hardhat");
const BN = require("ethers").BigNumber;
const owner = "0xb64968DFb5FdcF7176c9c3f6aE6c7D0b0AAD92aF";

async function main() {

  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0x525796E8C77CdFef28646Ae9C0977C59Ff0AF6d6",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/ION.sol:ION",
  // });
  // ////////////REWARDS PROXY///////////
  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0x8c8bd4553723c5E44d761B37511d98FA62167cdc",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  // });
  // ////////STAKING PROXY////////////
  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0x6Ac0B0b412040b51801ceb428399c1813B481677",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  // });
  // /////SUPERCHARGE PROXY//////////
  //   await hre.run("verify:verify", {
  //     //Deployed contract address
  //     address: "0xB275f582EbE9672BB8FD547922B9D7D064216548",
  //     //Pass arguments as string and comma seprated values
  //     constructorArguments: [],
  //     //Path of your main contract.
  //     contract: "contracts/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  //   });
  // /////////ADMIN PROXY/////////////////
  //   await hre.run("verify:verify", {
  //     //Deployed contract address
  //     address: "0x7cb5efB2e6D8e8Ee5003FA13e629c2CC0D1b8827",
  //     //Pass arguments as string and comma seprated values
  //     constructorArguments: [],
  //     //Path of your main contract.
  //     contract: "contracts/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  //   });
//////////////////////////////////////////////////////---------------
  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0xE50D567c8D34bf69c2DaBF96cB34ef6Fc1fBB2E5",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/TokenA.sol:TokenA",
  // });

  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0xE3116cCA6bD98d24Cf83b90c148a07c3a554C36F",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/Admin.sol:Admin",
  // });

  
  await hre.run("verify:verify", {
    //Deployed contract address
    address: "0x98b51dDC7C4b6648700Ef4Bd3c96014fe74d7dCd",
    //Pass arguments as string and comma seprated values
    constructorArguments: [],
    //Path of your main contract.
    contract: "contracts/TokenSaleUSDB.sol:TokenSaleUSDB",
  });

  await hre.run("verify:verify", {
    //Deployed contract address
    address: "0x64859430ADC439e59B709b8D40deD5d7c9EBB14d",
    //Pass arguments as string and comma seprated values
    constructorArguments: [],
    //Path of your main contract.
    contract: "contracts/TokenSaleETH.sol:TokenSaleETH",
  });
  
  
  // await hre.run("verify:verify", {
  //     //Deployed contract address
  //   address: "0x3fAeccE89A2b46Ca760f3a4886D406A25A1f8831",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: ["TestUSDC","USDC"],
  //   //Path of your main contract.
  //   contract: "contracts/USDC.sol:USDCWithSixDecimal",
  // });

  ///////////////////////////////////////////////////-------------------------
  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0xDe863A66d9763E87fCF531355216F6b775523917",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/Staking.sol:Staking",
  // });

  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0x0340b8Db8c2b226c31D095EB0686F99D5F41Df1b",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/SuperCharge.sol:SuperCharge",
  // });


  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0x2aa5C203c0428C20e64FBDC3F95C76da42D28e19",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract: "contracts/AirdropReward.sol:ProjectReward",
  // });

  //  await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0x6D7454f1d07eE6af3364b8c1176Aecce99Cb084f",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: ["0xf03731239d662B1780798b8645629691e3b2d33F","0xEeD204CBb983A1E7ca1b41CeEe28a532e4B13e4c"],
  //   //Path of your main contract.
  //   contract: "contracts/mock_router/UniswapV2Router02.sol:UniswapV2Router02",
  // });

  // await hre.run("verify:verify", {
  //   //Deployed contract address
  //   address: "0xd6d3B4254B4526c3095d8AB00B75f186c56dD72C",
  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [
  //     "Lithium IONs",
  //     "IONs",
  //   BN.from("50000000").mul(BN.from("10").pow("18")),
  //     "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  //     owner,
  //     "0x09498e02202D034a407bf109F486F336103C4f19",
  //     "0x7cb5efB2e6D8e8Ee5003FA13e629c2CC0D1b8827",
  //     "0xF23B41Ccb68dA234Dd6Df7b6b72B4180bC82EFDC",
  //     "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  //   ],
  //   //Path of your main contract.
  //   contract: "contracts/ION.sol:ION",
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
//npx hardhat run --network rinkeby  scripts/verify.ts
