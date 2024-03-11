// const { expect } = require("chai");
// const { parseEther } = require("ethers/lib/utils");
// const { ethers } = require("hardhat");
// const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;

// describe("Check epoch",async()=>{

//     let Staking;
//     let accounts;
//     let admin;
//     let ebsc;
//     let Router;
//     let Weth;
//     let Factory;
//     let airdrops;
//     let oracle;
//     let TokenSale;

//     beforeEach(async()=>{

//         Staking = await ethers.getContractFactory("Staking");
//         Admin = await ethers.getContractFactory("Admin");
//         EBSC = await ethers.getContractFactory("EBSC");
//         TokenSale = await ethers.getContractFactory("TokenSale");
//         Weth = await ethers.getContractFactory("WETH");
//         Factory = await ethers.getContractFactory("UniswapV2Factory");
//         Router = await ethers.getContractFactory("UniswapV2Router01");
//         Airdrops = await ethers.getContractFactory("Airdrops");
//         Oracle = await ethers.getContractFactory("ChainLink");
//         Hash = await ethers.getContractFactory("CallHash");
//         [owner] = await ethers.getSigners();
//         accounts = await ethers.getSigners();

//         admin = await Admin.deploy();
//         await admin.deployed();

//         staking = await Staking.deploy();
//         await staking.deployed();

//         factory = await Factory.deploy(owner.address);
//         await factory.deployed();

//         weth = await Weth.deploy();
//         await weth.deployed();

//         router = await Router.deploy(factory.address, weth.address);
//         await router.deployed();

//         ebsc = await EBSC.deploy(router.address);
//         await ebsc.deployed();

//         airdrops = await Airdrops.deploy(staking.address, admin.address, ebsc.address);
//         await airdrops.deployed();

//         oracle = await Oracle.deploy();
//         await oracle.deployed();

//         hash = await Hash.deploy();
//         await hash.deployed();

//         tokenSale = await TokenSale.deploy();
//         await tokenSale.deployed();
     
//         await admin.setOracleContract(oracle.address);
//         await admin.setMasterContract(tokenSale.address)
//         await admin.setAirdrop(airdrops.address);
//         await admin.setStakingContract(staking.address);

//         //console.log("Hash :-", await hash.getInitHash());
//         let EBSC_REQ = [[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000,30000000]];
//         staking.initialize(ebsc.address,admin.address,router.address,weth.address,EBSC_REQ);

//         await ebsc.excludeFromFee(staking.address);
//         await ebsc.excludeFromFee(airdrops.address);

//      });
//      describe("Staking epoch",async()=>{
//         it("epoch works on time",async()=>{
//             await admin.connect(owner).addOperator(owner.address);
//             await airdrops.setMarketingWallet(accounts[10].address);

//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("600000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("600000").mul(BN.from("10").pow("9")));

//             await airdrops.connect(owner).setEpochDuration(61);

//             await staking.connect(accounts[1]).stake(2,BN.from("600000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(owner).transfer(accounts[10].address,BN.from("100000000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(owner).transfer(accounts[2].address,BN.from("2000000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[2]).transfer(accounts[3].address,BN.from("2000000").mul(BN.from("10").pow("9")));

//             let amount = Number(await staking.getReflection());

//             await ebsc.connect(accounts[10]).approve(airdrops.address,amount);

//             function sleep(time){return new Promise((resolve) => setTimeout(resolve, time));}
//             await sleep(61000).then(async () => {
//             await airdrops.connect(accounts[1]).claimEBSC();
//             });
//         });
//      });

//     });