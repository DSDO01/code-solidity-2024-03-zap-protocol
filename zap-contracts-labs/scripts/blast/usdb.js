const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  Usdb = await ethers.getContractFactory("USDBWithEighteenDecimal");
  usdb = await Usdb.deploy("TestUSDB", "USDB");
  console.log({ usdb });
  await usdb.waitForDeployment();
  const usdbAddress = await usdb.getAddress();
  console.log("USDB", usdbAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
