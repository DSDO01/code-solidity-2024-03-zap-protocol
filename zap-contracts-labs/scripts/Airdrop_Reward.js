const BN = require("ethers").BigNumber;
const { ethers } = require("hardhat");
const {
  time, // time
  constants,
} = require("@openzeppelin/test-helpers");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();

  let Admin, TokenSale, LPToken, Staking, Oracle, Airdrops;
  let staking;
  let token;
  let admin;
  let master;
  let airdrops;

  const network = chainId == 56 ? "mainnet" : "testnet";
    const owner = "0x6cFCb9208fcCFC07237b9c43A371a2156173A28A"; //Rahul's mainnet address
    // const multisig = "0x09498e02202D034a407bf109F486F336103C4f19"; // Polygon multisig
    // const multisig = "0xe9dcD840baa1a165d14dA800deC15cf99B4237b1"; //Binance multisig

  const owner = "0xeA7FCEFA890eABdE2eEd91D5d7e7d7dF6C35089F";
  const multisig = "0x0B4d9ba9634D5782a4682ec5c8919A490A863E79";

  const settings = {
    mainnet: {
      backend: "0xF547b338FA93485158d3A843E4C20edb9E939eeb",
      oracle: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
    },
    testnet: {
      backend: "0xF547b338FA93485158d3A843E4C20edb9E939eeb",
      oracle: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    },
  };

  Upgradeability = await ethers.getContractFactory("OwnedUpgradeabilityProxy");
  Admin = await ethers.getContractFactory("Admin");
  TokenSale = await ethers.getContractFactory("TokenSale");
  LPToken = await ethers.getContractFactory("LPToken");
  Staking = await ethers.getContractFactory("Staking");
  ProjectReward = await ethers.getContractFactory("ProjectReward");

  proxy1 = await Upgradeability.deploy();
  await sleep(15000);

  console.log("proxy1 contract", proxy1.address);

  project = await ProjectReward.deploy();
  await sleep(15000);

  console.log("ProjectReward", project.address);

  projectProxy = await ProjectReward.attach(proxy1.address);
  await sleep(15000);
  console.log("project proxy", projectProxy.address);

  initializeData = ProjectReward.interface.encodeFunctionData("initialize", [
    owner,
    multisig,
  ]);

  await proxy1.upgradeToAndCall(project.address, initializeData);

  //   await project.initialize(owner,multisig);
  await sleep(15000);

  console.log("initialized");
  // await projectProxy.addOperator("0x68Bd509Dc8b69BCF8Bd933b0AB2810BCb934f01d"); ////////BEN's ADDRESS
  
// await projectProxy.addOperator("0xeA7FCEFA890eABdE2eEd91D5d7e7d7dF6C35089F"); ////////Rahul's ADDRESS
  
  // await projectProxy.addOperator("0x68Bd509Dc8b69BCF8Bd933b0AB2810BCb934f01d"); ////////BEN's ADDRESS


console.log("operator added");
  await sleep(10000);

  // verify
  try {
    await hre.run("verify:verify", {
      address: project.address,
      constructorArguments: [],
    });
  } catch (e) {
    console.log("Error");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
