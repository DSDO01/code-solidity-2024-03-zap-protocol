const BN = require('ethers').BigNumber;
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork()
  console.log("chainId", chainId);

  const network = chainId == 4 ? 'mainnet' : 'testnet';
  const owner = "0xC9b1dCfd782B36c2b1bc0FB2805c64cb64B2f225";
  const second = "0x522A1c691409cb2D8c2A212242FD52eCd29cC0C4";
  const third ="0xAaE51B6Aca8403EdE79f69dE10a4f6C02CccC453";
  console.log("network owner_address", network, owner);

  const settings = {
    mainnet: {
      backend: '0xF547b338FA93485158d3A843E4C20edb9E939eeb',
      oracle: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE'
    },
    testnet: {
      backend: '0xF547b338FA93485158d3A843E4C20edb9E939eeb',
      EBSC: "0xe009f161a0f1b8a6687029547afC7F399F85C879",
      oracle: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
    }
  }

  Weth = await ethers.getContractFactory("WETH9");
  Factory = await ethers.getContractFactory("UniswapV2Factory");
  Router = await ethers.getContractFactory("UniswapV2Router02");
  Ion = await ethers.getContractFactory("ION");
  Usdc = await ethers.getContractFactory("USDC");

  router = await Router.attach("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
  // router = await Router.deploy(factory.address,weth.address);
  // await router.deployed();

// console.log("factory and weth",factory.address,weth.address);
  console.log("router", router.address);

  ion = await Ion.deploy("Lithium",
    "ION",
    BN.from("10000").mul(BN.from("10").pow("18")),
    owner,
    "0x522A1c691409cb2D8c2A212242FD52eCd29cC0C4",
    "0xAaE51B6Aca8403EdE79f69dE10a4f6C02CccC453",
    "0xBF75d4C5DEF207cF1ef487aDC9752A80a879a27A",
    router.address,
    owner);
  console.log("ion address", ion.address);
  console.log("owner ion balance",String(await ion.balanceOf(owner)));
  // await ion.approve(router.address,BN.from("500000000").mul(BN.from("10").pow("18")));
  // console.log("allowance",String(await ion.allowance(owner,router.address)));
  // await sleep(6000);
//   await router.addLiquidityETH(ion.address,BN.from("100000").mul(BN.from("10").pow("18")),10,
//   1,
//   owner,
//   1659971655,
//   { value: BN.from("5").mul(BN.from("10").pow("15")) }
// );
console.log("Liquidity added successfully ");
    await ion.setStakingAddress("0x0b3f2c58499A96435b2b074439c164358a2171d3");
    await ion.setAirdropAddress("0xFfDB3568BF91317CDD68e8e264648D504f401dF3");
    await ion.setDevWallet(owner);
    await ion.setRewards([30, 15, 15, 40, 0]);
    console.log("done setter")
    // await router.connect(second).swapExactETHForTokensSupportingFeeOnTransferTokens("10000000000000000000", [weth.address, ion.address], third, 1659971655, { value: BN.from("1").mul(BN.from("10").pow("14")) });
  // console.log("DONEE");

      // await ion.owner();
      
  // verify
  try {
    await hre.run("verify:verify", {
      address: ion.address,
      constructorArguments: ["Lithium",
      "ION",
      BN.from("10000").mul(BN.from("10").pow("18")),
      owner,
      "0x522A1c691409cb2D8c2A212242FD52eCd29cC0C4",
      "0xAaE51B6Aca8403EdE79f69dE10a4f6C02CccC453",
      "0xBF75d4C5DEF207cF1ef487aDC9752A80a879a27A",
      router,
      owner],
    });
  } catch (e) {
    console.log('Error');
  }
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });