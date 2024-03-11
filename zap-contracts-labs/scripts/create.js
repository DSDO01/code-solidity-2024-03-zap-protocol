const { ethers } = require("hardhat");

/* eslint-disable no-undef */
const BN = require("ethers").BigNumber;

const dotenv = require("dotenv");
dotenv.config();

const duration = {
  seconds(val) {
    return BigInt(val);
  },
  minutes(val) {
    return BigInt(val) * this.seconds(60);
  },
  hours(val) {
    return BigInt(val) * this.minutes(60);
  },
  days(val) {
    return BigInt(val) * this.hours(24);
  },
  weeks(val) {
    return BigInt(val) * this.days(7);
  },
  years(val) {
    return BigInt(val) * this.days(365);
  },
};

async function main() {
  const [deployer] = await ethers.getSigners();

  let masterContract;
  let adminContract;
  let stakingContract;
  let lpToken;
  let oracle = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
  let backend = process.env.DEPLOYER_WALLET;
  const totalSupply = BigInt("1000000") * 10n ** 9n;

  accounts = await ethers.getNamedSigners();

  console.log({ accounts });
  const { deploy } = deployments;

  const Admin = await ethers.getContractFactory("Admin");
  const admin = Admin.attach("0x0C0351aD7B0878d7c8a3f6fC54a0f7C7eA75d0CA");

  const LpToken = await ethers.getContractFactory("LPToken");
  const lptoken = LpToken.attach("0x201c40Bf1251c6BcdA8B4513e64d0DCd1a59A6Fb");

  const Staking = await ethers.getContractFactory("Staking");
  const staking = Staking.attach("0x774633f17DA48A40DeD30D841A92170D9955874B");

  await deploy("LPToken", {
    from: deployer.address,
    args: ["LPToken", "lp"],
    log: true,
  });

  lpToken = await ethers.getContract("LPToken");

  const lpTokenAddress = await lpToken.getAddress();
  console.log("LPToken deployed at: ", lpTokenAddress);
  const adminContractAddress = await adminContract.getAddress();
  console.log("Admin deployed at: ", adminContractAddress);
  const masterContractAddress = await masterContract.getAddress();
  console.log("Master deployed at: ", masterContractAddress);

  await deploy("Staking", {
    from: deployer.address,
    args: [lpTokenAddress, adminContractAddress],
    log: true,
  });
  stakingContract = await ethers.getContract("Staking");

  const stakingContractAddress = await stakingContract.getAddress();

  await adminContract.addOperator(deployer.address);
  //backend address
  await adminContract.addOperator(backend);
  await adminContract.setMasterContract(masterContractAddress);
  await adminContract.setOracleContract(oracle);
  await adminContract.setStakingContract(stakingContractAddress);

  defaultParams = {
    initial: deployer.address,
    totalSupply: totalSupply,
    privateTokenPrice: BigInt("240297408185753"),
    publicTokenPrice: BigInt("360446112278630"),
    publicBuyLimit: BigInt("1000") * 10n ** 18n,
    escrowPercentage: 0n, // Assuming this is intended to be a BigInt
    tierLimits: [
      BigInt("200") * 10n ** 18n,
      BigInt("500") * 10n ** 18n,
      BigInt("1000") * 10n ** 18n,
      BigInt("2500") * 10n ** 18n,
    ],
    escrowReturnMilestones: [],
    thresholdPublicAmount: (totalSupply * 5n) / 100n,
    airdrop: totalSupply / 100n,
    tokenFeePct: 0n, // Assuming this is intended to be a BigInt
    valueFeePct: 800n, // Assuming this is intended to be a BigInt
  };

  console.log(`Master: ${masterContractAddress}`);
  console.log(`LPtoken: ${lpTokenAddress}`);
  console.log(`Admin: ${adminContractAddress}`);
  console.log(`Staking: ${stakingContractAddress}`);
  // verify
  await hre.run("verify:verify", {
    address: masterContractAddress,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: lpTokenAddress,
    constructorArguments: ["LPToken", "lp"],
  });
  await hre.run("verify:verify", {
    address: stakingContractAddress,
    constructorArguments: [lpTokenAddress, adminContractAddress],
  });

  await hre.run("verify:verify", {
    address: adminContractAddress,
    constructorArguments: [],
  });

  // await createPool({privateStart: '1634043600', privateEnd: '1634047200', publicStart: '1634047500', publicEnd: '1634051100'}, 1);
  // await createPool({privateStart: '1634058000', privateEnd: '1634061600', publicStart: '1634061900', publicEnd: '1634065500'}, 2);
  // await createPool({privateStart: '1634036400', privateEnd: '1634037600', publicStart: '1634038200', publicEnd: '1634040000'}, 3);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
