const hre = require("hardhat");

const { ethers } = hre;

require("@nomiclabs/hardhat-ethers");

const dotenv = require("dotenv");

dotenv.config();

async function main() {
  const backendWallet = process.env.DEPLOYER_WALLET; // this should be the CMS wallet ultimately

  console.log({ backendWallet });

  const [deployer] = await ethers.getSigners();
  console.log({ backendWallet, deployer });
  const { chainId } = await ethers.provider.getNetwork();

  let Admin,
    TokenSale,
    LPToken,
    Staking,
    VestingFactory,
    Oracle,
    Airdrops,
    ERC20Factory,
    SimpleERC20;
  let staking;
  let token;
  let admin;
  let master;
  let vesting;
  let erc20Factory;
  let simpleERC20;

  // let airdrops;

  const network = chainId === 56 ? "mainnet" : "testnet";

  const settings = {
    mainnet: {
      backend: backendWallet,
      oracle: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
    },
    testnet: {
      backend: backendWallet,
      oracle: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    },
  };

  Admin = await ethers.getContractFactory("Admin");
  TokenSale = await ethers.getContractFactory("TokenSale");
  LPToken = await ethers.getContractFactory("LPToken");
  Staking = await ethers.getContractFactory("Staking");
  Vesting = await ethers.getContractFactory("Vesting");
  VestingFactory = await ethers.getContractFactory("VestingFactory");
  ERC20Factory = await ethers.getContractFactory("ERC20Factory");
  SimpleERC20 = await ethers.getContractFactory("SimpleERC20");

  erc20Factory = await ERC20Factory.deploy();
  await erc20Factory.waitForDeployment();
  const erc20FactoryAddress = await erc20Factory.getAddress();
  console.log(erc20FactoryAddress, "ERC20Factory Contract");

  simpleERC20 = await SimpleERC20.deploy(
    "SimpleERC20",
    "SPL",
    18,
    1000000,
    backendWallet
  );
  await simpleERC20.waitForDeployment();
  const simpleERC20Address = await simpleERC20.getAddress();
  console.log(simpleERC20Address, "SimpleERC20 Contract");

  // Airdrops = await ethers.getContractFactory("Airdrops");

  vesting = await Vesting.deploy();
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();

  admin = await Admin.deploy();
  await admin.waitForDeployment();
  const adminAddress = await admin.getAddress();
  await admin.initialize(backendWallet);

  console.log(adminAddress, "Admin Contract");

  master = await TokenSale.deploy();
  await master.waitForDeployment();
  const masterAddress = await master.getAddress();
  console.log(masterAddress, "TokenSale(Master) Contract");

  token = await LPToken.deploy("LPToken", "LPT");
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(tokenAddress, "LPtoken Contract");

  staking = await Staking.deploy();
  // staking = await Staking.deploy(tokenAddress, adminAddress, ); // this might need to be changed? we'll see
  await staking.waitForDeployment();

  const usdbAddress = "0xe2adDF971904C531CdB885607719677ed642A18B";

  await vesting.initialize(
    masterAddress,
    adminAddress,
    usdbAddress,
    backendWallet,
    [
      [1647851220, 600],
      [1647851920, 200],
      [1647852520, 200],
    ]
  );

  const vestingFactory = await VestingFactory.deploy(vestingAddress);
  await vestingFactory.waitForDeployment();
  const vestingFactoryAddress = await vestingFactory.getAddress();
  await vestingFactory.setOperator(backendWallet);
  console.log(vestingAddress, "Vesting address");

  console.log(vestingFactoryAddress, "Vesting Factory address");

  // await staking.initialize(tokenAddress, adminAddress);

  const stakingAddress = await staking.getAddress();

  console.log(stakingAddress, "Staking Contract");

  // airdrops = await Airdrops.deploy(
  //   stakingAddress,
  //   adminAddress,
  //   tokenAddress
  // );
  // await airdrops.waitForDeployment();

  await admin.addOperator(settings[network].backend);
  console.log("has set operator on admin contract");
  await admin.setMasterContract(masterAddress);
  console.log("has set masterContract on admin contract");
  // await admin.setOracleContract(settings[network].oracle);
  // console.log("has set oracleContract on admin contract");
  // await admin.setAirdrop(airdrops.address);
  await admin.setStakingContract(stakingAddress);
  console.log("has set stakingContract on admin contract");

  console.log(stakingAddress, "Staking Contract");
  console.log(tokenAddress, "LPtoken Contract");
  console.log(adminAddress, "Admin Contract");
  console.log(masterAddress, "TokenSale(Master) Contract");
  // console.log(airdrops.address, "Airdrops Contract");
  // verify
  try {
    await hre.run("verify:verify", {
      address: masterAddress,
      constructorArguments: [],
    });
  } catch (e) {
    console.log("Error");
  }
  try {
    await hre.run("verify:verify", {
      address: tokenAddress,
      constructorArguments: ["LPToken", "LPT"],
    });
  } catch (e) {
    console.log("Error");
  }
  try {
    await hre.run("verify:verify", {
      address: vestingAddress,
      constructorArguments: [],
    });
  } catch (e) {
    console.log("Error");
  }
  try {
    await hre.run("verify:verify", {
      address: vestingFactoryAddress,
      constructorArguments: [vestingAddress],
    });
  } catch (e) {
    console.log("Error");
  }

  // TODO: fix verification
  // try {
  //   await hre.run("verify:verify", {
  //     address: stakingAddress,
  //     constructorArguments: [tokenAddress, adminAddress],
  //   });
  // } catch (e) {
  //   console.log("Error");
  // }

  try {
    await hre.run("verify:verify", {
      address: adminAddress,
      constructorArguments: [],
    });
  } catch (e) {
    console.log("Error");
  }

  // try {
  //   await hre.run("verify:verify", {
  //     address: airdrops.address,
  //     constructorArguments: [stakingAddress, adminAddress, tokenAddress],
  //   });
  // } catch (e) {
  //   console.log("Error");
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
