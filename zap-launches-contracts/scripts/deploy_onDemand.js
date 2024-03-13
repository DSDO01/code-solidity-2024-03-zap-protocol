const BN = require("ethers").BigNumber;
const { ethers } = require("hardhat");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
    SuperCharge = await ethers.getContractFactory("SuperCharge");
    Upgradeability = await ethers.getContractFactory("OwnedUpgradeabilityProxy");
    Rewards = await ethers.getContractFactory("Rewards");
    TokenSale = await ethers.getContractFactory("TokenSale");
    Admin = await ethers.getContractFactory("Admin");

    // superCharge = await SuperCharge.deploy();
    // await superCharge.deployed();

    // console.log("Supercharge deployed at: ", superCharge.address);

    admin = await Admin.deploy();
     await sleep(2000);
    console.log("Admin address", admin.address);

    tokenSale = await TokenSale.deploy();
    await sleep(2000);
    console.log("tokenSale address", tokenSale.address);

    // rewards = await Rewards.deploy();
    // await rewards.deployed();

    // console.log("Rewards deployed at: ", rewards.address);


    // proxySupercharge = await Upgradeability.attach("0xB275f582EbE9672BB8FD547922B9D7D064216548");
    // proxyRewards = await Upgradeability.attach("0x8c8bd4553723c5E44d761B37511d98FA62167cdc");

    // await proxySupercharge.upgradeTo(superCharge.address);

    // await proxyRewards.upgradeTo(rewards.address);

    await hre.run("verify:verify", {
      //Deployed contract address
      address: tokenSale.address,
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