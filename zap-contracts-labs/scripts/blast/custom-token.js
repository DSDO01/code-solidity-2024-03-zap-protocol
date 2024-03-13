const hre = require("hardhat");
const { ethers } = hre;

const NAME = process.env.MINTABLE_ERC20_NAME || "Zaps";
const SYMBOL = process.env.MINTABLE_ERC20_SYMBOL || "USDB";

async function main() {
  Usdb = await ethers.getContractFactory("USDBWithEighteenDecimal");
  usdb = await Usdb.deploy(NAME, SYMBOL);
  console.log({ usdb });
  await usdb.waitForDeployment();
  const usdbAddress = await usdb.getAddress();
  console.log("CREATED - ", SYMBOL, usdbAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
