const BN = require("ethers").BigNumber;
const { ethers } = require("hardhat");
const {
  time, // time
  constants,
} = require("@openzeppelin/test-helpers");

//TODO set the ebsc stake holder and all other setter functions.

async function main() {
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();

  const owner = "0xeA7FCEFA890eABdE2eEd91D5d7e7d7dF6C35089F";
  const MarketingWallet = "0xeA7FCEFA890eABdE2eEd91D5d7e7d7dF6C35089F";

  const settings = {
    testnet: {
      backend: "0xF547b338FA93485158d3A843E4C20edb9E939eeb",
      oracle: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
      ebsc: "0xfafD3394C6A33A1fD45bC2442F103B04f2690a07",
      token: "0xF2b1B4EfBF1Bd79b6516Dd3fB4d294464A65E393",
      router: "0xf6B310EeC4E5cD5d06f0C76e4504F32c19D5297d",
      weth: "0x25b0F82Cccaf3152f5C9ffcF846851d5151ef5aC",
      busd: "0xD631C7CFc2b44ec1ef60fc9D2d61e5cCfC0C0E8b",
      admin: "0xBD37eb30EeC34D2D54AE8288260505e52cD7d49c",
      tokenSale: "0x97b8Fef68AE3C898dC27950bF0F1c420580C9E8A",
      oracle: "0x3781A57F5eFEd4fE2726a9c7acb62F667a89752d",
      staking: "0xf9513f0C447fae15Dd1dD5ce2A3526D1b4622a54",
      airdrops: "0x92DFEdE250c9f4f9568012355524aF9F3D43A85d",
      faucet: "0xCF967d016818C5432d57fb45e22A221969EBbeE4",
      airdropReward: "0x2Bb2e22A3C803295694531Ed9C2D8C022AD8C63a"
    },
  };
  const network = chainId == 56 ? "mainnet" : "testnet";

  Admin = await ethers.getContractFactory("Admin");
  TokenSale = await ethers.getContractFactory("TokenSale");
  Token = await ethers.getContractFactory("Token");
  // LPToken = await ethers.getContractFactory("lp");
  Staking = await ethers.getContractFactory("Staking");
  Oracle = await ethers.getContractFactory("ChainLink");
  Airdrops = await ethers.getContractFactory("Airdrops");
  Weth = await ethers.getContractFactory("WETH");
  //   Factory = await ethers.getContractFactory("UniswapV2Factory");
  Router = await ethers.getContractFactory("UniswapV2Router01");
  getinit = await ethers.getContractFactory("CalHash");
  Ebsc = await ethers.getContractFactory("EBSC");
  Faucet = await ethers.getContractFactory("Faucet");
  AirdropReward = await ethers.getContractFactory("AirdropReward"); 

  //   token = await Token.deploy("TokenIDO", "tknIDO");
  //   await token.deployed();

//   faucet = await Faucet.deploy("0xf45d94927cCF82A44dE5f0A8e1973e0c80743675", "0xD631C7CFc2b44ec1ef60fc9D2d61e5cCfC0C0E8b");
//   console.log("faucet address", faucet.address);

//   token = await Token.attach(settings[network].token);
//   console.log(token.address, "token Contract");

  routerContract = await Router. attach(settings[network].router);
  console.log(routerContract.address, "Router Contract");

  wbnbContract = await Weth.attach(settings[network].weth);
  console.log(wbnbContract.address, "wbnb address");

    // ebsc = await Ebsc.deploy(routerContract.address);
  ebscContract = await Ebsc.attach(settings[network].ebsc);
  console.log(ebscContract.address, "EBSC token address");

  // adminContract = await Admin.attach(settings[network].admin);
    adminContract = await Admin.deploy();
  console.log(adminContract.address, "Admin Contract");

    // tokenSaleContract = await TokenSale.deploy();
  // tokenSaleContract = await TokenSale.attach(settings[network].tokenSale);
  // console.log(tokenSaleContract.address, "TokenSale Contract");

    oracleContract = await Oracle.attach(settings[network].oracle);
    console.log(oracleContract.address, "Oracle Contract");

    stakingContract = await Staking.deploy();
  // stakingContract = await Staking.attach(settings[network].staking);
  console.log(stakingContract.address, "staking Contract");

//  airdropContract = await Airdrops.deploy();
  // airdropContract = await Airdrops.attach(settings[network].airdrops);
  // console.log(airdropContract.address, "Airdrop Contract");

  // airdropReward = await AirdropReward.deploy();
  // airdropReward = await AirdropReward.attach(settings[network].airdropReward)
  // console.log(airdropReward.address, "AirdropReward contract");

  // await ebscContract.approve(
  //   routerContract.address,
  //   BN.from("99999999999999999999999999").mul(BN.from("10").pow("9"))
  // );
  // console.log("approved");

//   await routerContract.addLiquidityETH(
//     ebscContract.address,
//     BN.from("320000").mul(BN.from("10").pow("9")),
//     1,
//     1,
//     owner,
//     1698026418,
//     {value: BN.from("1").mul(BN.from("10").pow("18"))}
//   );
  console.log("liquidity added");

  // await adminContract.addOperator(owner);
  console.log("after add operator");

  // await adminContract.setMasterContract(tokenSaleContract.address);
  console.log("after setMaster contract ")
  

  // await adminContract.setOracleContract(oracleContract.address);

  await adminContract.setStakingContract(stakingContract.address);
  console.log("set staking contract")

  // await adminContract.setAirdrop(airdropContract.address);

  console.log("after airdrop");

  await ebscContract.approve(
    stakingContract.address,
    BN.from("99999999999999999999999999").mul(BN.from("10").pow("18"))
  );
  console.log("1");

  // await ebscContract.approve(
  //   airdropContract.address,
  //   BN.from("99999999999999999999999999").mul(BN.from("10").pow("18"))
  // );
  console.log("2");

  await ebscContract.excludeFromFee(stakingContract.address);
  console.log("3");

  // await ebscContract.excludeFromFee(airdropContract.address);
  // await ebscContract.excludeFromFee(MarketingWallet);
  // await ebscContract.excludeFromFee(router.getPair().address);
  console.log("4");

  // await airdropContract.setEpochDuration(300);
  console.log("5");
  // await airdropContract.setMarketingWallet(MarketingWallet);
  console.log("6");

  const EbscReq = [
    [200000, 600000, 1000000, 2500000, 5000000, 7000000],
    [200000, 600000, 1000000, 2500000, 5000000, 7000000],
    [200000, 600000, 1000000, 2500000, 5000000, 7000000],
    [200000, 600000, 1000000, 2500000, 5000000, 7000000, 30000000],
  ];

  const allocation = 
    [
      [15, 75, 150, 350, 750, 1125],
      [30, 115, 225, 550, 1125, 1650],
      [60, 225, 350, 825, 1650, 2350],
      [200, 600, 850, 1650, 2350, 3000, 7500],
    ];

  await stakingContract.initialize(
    ebscContract.address,
    adminContract.address,
    routerContract.address,
    wbnbContract.address,
    EbscReq
  );

  console.log("after initialize");
  await stakingContract.setAllocations(allocation);
  console.log("All contracts deployed");

//   //verify
//   //   try {
//   //     await hre.run("verify:verify", {
//   //       address: tokenSaleContract.address,
//   //       constructorArguments: [],
//   //     });
//   //   } catch (e) {
//   //     console.log("Error", e);
//   //   }
//   //   try {
//   //     await hre.run("verify:verify", {
//   //       address: ebscContract.address,
//   //       constructorArguments: ["TokenIDO", "tknIDO"],
//   //     });
//   //   } catch (e) {
//   //     console.log("Error", e);
//   //   }
//   //   try {
//   //     await hre.run("verify:verify", {
//   //       address: stakingContract.address,
//   //       constructorArguments: [
//   //         ebscContract.address,
//   //         adminContract.address,
//   //         routerContract.address,
//   //         wbnbContract.address,
//   //       ],
//   //     });
//   //   } catch (e) {
//   //     console.log("Error", e);
//   //   }

//   //   try {
//   //     await hre.run("verify:verify", {
//   //       address: adminContract.address,
//   //       constructorArguments: [],
//   //     });
//   //   } catch (e) {
//   //     console.log("Error", e);
//   //   }

//   //   try {
//   //     await hre.run("verify:verify", {
//   //       address: airdropContract.address,
//   //       constructorArguments: [
//   //         stakingContract.address,
//   //         adminContract.address,
//   //         ebscContract.address,
//   //       ],
//   //     });
//   //   } catch (e) {
//   //     console.log("Error", e);
//   //   }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
