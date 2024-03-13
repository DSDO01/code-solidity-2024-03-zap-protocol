// const BN = require("ethers").BigNumber;
const hre = require("hardhat");

const { ethers } = hre;

require("@nomiclabs/hardhat-ethers");
// const { ethers } = require("ethers");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  console.log("deploying", { ethers });
  SuperCharge = await ethers.getContractFactory("SuperCharge");
  console.log("deployed supercharge");
  Upgradeability = await ethers.getContractFactory("OwnedUpgradeabilityProxy");
  Rewards = await ethers.getContractFactory("Rewards");
  TokenSale = await ethers.getContractFactory("TokenSale");
  Admin = await ethers.getContractFactory("Admin");

  superCharge = await SuperCharge.deploy();
  await superCharge.waitForDeployment();

  const superchargeAddress = await superCharge.getAddress();
  console.log("Supercharge deployed at: ", superchargeAddress);

  admin = await Admin.deploy();
  await sleep(2000);
  const adminAddress = await admin.getAddress();
  console.log("Admin address", adminAddress);

  tokenSale = await TokenSale.deploy();
  await sleep(2000);
  const tokenSaleAddress = await tokenSale.getAddress();
  console.log("tokenSale address", tokenSaleAddress);

  rewards = await Rewards.deploy();
  await rewards.waitForDeployment();

  const rewardsAddress = await rewards.getAddress();

  console.log("Rewards deployed at: ", rewardsAddress);

  // TODO: deploy our own supercharge and rewards proxies
  // proxySupercharge = await Upgradeability.attach(
  //   "0xB275f582EbE9672BB8FD547922B9D7D064216548" // TODO: figure out where this proxy is and how to make our own
  // );

  // proxyRewards = await Upgradeability.attach(
  //   "0x8c8bd4553723c5E44d761B37511d98FA62167cdc"
  // );

  // await proxySupercharge.upgradeTo(superchargeAddress);

  // await proxyRewards.upgradeTo(rewardsAddress);

  await hre.run("verify:verify", {
    //Deployed contract address
    address: tokenSaleAddress,
    //Pass arguments as string and comma seprated values
    constructorArguments: [],
    //Path of your main contract.
    contract: "contracts/TokenSale.sol:TokenSale",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
