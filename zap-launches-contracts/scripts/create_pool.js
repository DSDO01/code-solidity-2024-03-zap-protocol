
const BN = require("ethers").BigNumber;
const { ethers } = require("hardhat");
const {
  time, // time
  constants,
} = require("@openzeppelin/test-helpers");

async function main() {
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();

  const owner = "0xeA7FCEFA890eABdE2eEd91D5d7e7d7dF6C35089F";

  const settings = {
    testnet: {
      token: "0xF2b1B4EfBF1Bd79b6516Dd3fB4d294464A65E393",
      EBSC: "0xf45d94927cCF82A44dE5f0A8e1973e0c80743675",
      tokensale: "0x5E58496c6D89E2893a2cF36d5fc1bC66Ff0d9Ecb",
      admin: "0x64A284157d8395a152bc3b01ba5557BA6D847723",
    },
  };
  const network = chainId == 56 ? "mainnet" : "testnet";

  ////lp = ebsc , tkn =busd , jas= pool token
  Admin = await ethers.getContractFactory("Admin");
  TokenSale = await ethers.getContractFactory("TokenSale");
  Token = await ethers.getContractFactory("Token");
  // LPToken = await ethers.getContractFactory("lp");
  Staking = await ethers.getContractFactory("Staking");
  Oracle = await ethers.getContractFactory("ChainLink");
  Airdrops = await ethers.getContractFactory("Airdrops");
  Weth = await ethers.getContractFactory("WETH");
  Factory = await ethers.getContractFactory("UniswapV2Factory");
  Router = await ethers.getContractFactory("UniswapV2Router01");
  Ebsc = await ethers.getContractFactory("EBSC");


  tokenSaleContract = await TokenSale.attach(settings[network].tokensale);
  adminContract = await Admin.attach(settings[network].admin);
  // tokenSaleContract = await TokenSale.deploy();
  console.log(tokenSaleContract.address, "TokenSale Contract");


  const newAuuurray = [[15, 60, 120, 360, 750, 1125], [30, 120, 240, 720, 1500, 2250], [45, 180, 360, 1080, 2250, 3375], [75, 300, 600, 1800, 3750, 5625, 7500]]

  const EbscReq = [[200000, 600000, 1000000, 2500000, 5000000, 7000000],
  [200000, 600000, 1000000, 2500000, 5000000, 7000000],
  [200000, 600000, 1000000, 2500000, 5000000, 7000000],
  [200000, 600000, 1000000, 2500000, 5000000, 7000000, 30000000]];


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

  const now = (await time.latest()).toNumber();
  const newNow = BN.from(now).add(duration.minutes(5));
  const end = BN.from(newNow).add(duration.minutes(15));

  // defaultToken = await Token.deploy("DefaultToken", "def");

  defaultToken = await Token.attach(settings[network].token);
  console.log(defaultToken.address, "defaultToken");
  // await defaultToken.changeDecimals(decimals);

  defaultParams = {
    totalSupply: BN.from("10000").mul(BN.from("10").pow("18")),
    token: defaultToken.address,
    privateTokenPrice: BN.from("1").mul(BN.from("10").pow("18")),
    initial: owner,
    privateStart: (newNow),
    privateEnd: (end),
    vestingPoints: [
      [end.add(duration.minutes(3)), BN.from("500")],
      [end.add(duration.minutes(6)), BN.from("300")],
      [end.add(duration.minutes(9)), BN.from("200")],
    ],
  };
  await adminContract.createPool(defaultParams);
  console.log("creating pool");

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });