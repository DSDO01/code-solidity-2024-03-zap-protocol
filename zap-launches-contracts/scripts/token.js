const BN = require("ethers").BigNumber;
const { ethers } = require("hardhat");
const {
  time, // time
  constants,
} = require("@openzeppelin/test-helpers");

// const BN = require("ethers").BigNumber;

const duration = {
  seconds(val) {
    return BN.from(val);
  },
  minutes(val) {
    return BN.from(val).mul(this.seconds("60"));
  },
  hours(val) {
    return new BN.from(val).mul(this.minutes("60"));
  },
  days(val) {
    return new BN.from(val).mul(this.hours("24"));
  },
  weeks(val) {
    return new BN.from(val).mul(this.days("7"));
  },
  years(val) {
    return new BN.from(val).mul(this.days("365"));
  },
};
//TODO set the ebsc stake holder and all other setter functions.

async function main() {
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();

  const owner = "0xC9b1dCfd782B36c2b1bc0FB2805c64cb64B2f225";
  const MarketingWallet = "0xC9b1dCfd782B36c2b1bc0FB2805c64cb64B2f225";

  const network = chainId == 56 ? "mainnet" : "testnet";
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
      airdropReward: "0x2Bb2e22A3C803295694531Ed9C2D8C022AD8C63a",
    },
  };
  Token = await ethers.getContractFactory("Token");
  IONToken = await ethers.getContractFactory("ION");
  Router = await ethers.getContractFactory("UniswapV2Router01");
  Usdc = await ethers.getContractFactory("USDCWithSixDecimal");

  usdc = await Usdc.deploy("TestUSDC","USDC");
  await usdc.deployed();
  console.log("USDC", usdc.address);


}
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// function sleep(ms: any) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
// await sleep(5000).then(async () => {
// try {
//   await hre.run("verify:verify", {
//     address: ionToken.address,
//     constructorArguments: [
//      
//     ],
//     contract: "contracts/ION.sol:ION",
//   });
// } catch (e) {
//   console.log("Error", e);
// }
// });
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
