// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;

// describe("Airdrop-Test",async()=>{
//     beforeEach(async () => {

//         [owner] = await ethers.getSigners();
//         accounts = await ethers.getSigners();
//         provider = ethers.provider;

//         Admin = await ethers.getContractFactory("Admin");
//         EBSC = await ethers.getContractFactory("EBSC");
//         TokenSale = await ethers.getContractFactory("TokenSale");
//         Staking = await ethers.getContractFactory("Staking");
//         Oracle = await ethers.getContractFactory("ChainLink");
//         Airdrops = await ethers.getContractFactory("Airdrops");
//         Weth = await ethers.getContractFactory("WETH");
//         Factory = await ethers.getContractFactory("UniswapV2Factory");
//         Router = await ethers.getContractFactory("UniswapV2Router01");
//         getinit = await ethers.getContractFactory("CalHash");
//         LPToken = await ethers.getContractFactory("Token");

//         Getinit = await getinit.deploy();
//         await Getinit.deployed();
//         //console.log("init", await Getinit.getInitHash());

//         factory = await Factory.deploy(owner.address);
//         await factory.deployed();

//         weth = await Weth.deploy();
//         await weth.deployed();
//         // console.log("Weth address: ", weth.address);

//         router = await Router.deploy(factory.address, weth.address);
//         await router.deployed();
//         //console.log(router.address);

//         ebsc = await EBSC.deploy(router.address);
//         await ebsc.deployed();

//         admin = await Admin.deploy();
//         await admin.deployed();

//         tokenSaleContract = await TokenSale.deploy();
//         await tokenSaleContract.deployed();

//         oracle = await Oracle.deploy();
//         await oracle.deployed();

//         staking = await Staking.deploy();
//         await staking.deployed();

//         lpToken = await LPToken.deploy("LPToken", "lptkn");
//         await lpToken.deployed();

//         airdrops = await Airdrops.deploy(staking.address, admin.address, ebsc.address);
//         await airdrops.deployed();

//         let EBSC_REQ = [[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000,30000000]];
//         staking.initialize(ebsc.address,admin.address,router.address,weth.address,EBSC_REQ);

//         await admin.setAirdrop(airdrops.address);
//         await ebsc.excludeFromFee(staking.address);
//         await ebsc.excludeFromFee(airdrops.address);
//         await ebsc.connect(owner).setTaxFeePercent(8);

//     });

//     describe("Airdrop generation",async()=>{
//         it("requires a valid amount",async()=>{
//             await airdrops.connect(owner).setEpochDuration(999999999);
//             await admin.connect(owner).addOperator(owner.address);
//             await expect(airdrops.connect(owner).addAirdrop(BN.from("2").mul(BN.from("10").pow("18")),"0x0000000000000000000000000000000000000001",{ value: BN.from("1").mul(BN.from("10").pow("18"))})).to.be.revertedWith("Invalid amount");
//         });
//         it("allows airdroping erc20 tokens",async()=>{
//             await airdrops.connect(owner).setEpochDuration(999999999);
//             await admin.connect(owner).addOperator(owner.address);
//             await ebsc.connect(owner).approve(airdrops.address,BN.from("200000").mul(BN.from("10").pow("9")))
//             await airdrops.connect(owner).addAirdrop(BN.from("200000").mul(BN.from("10").pow("9")),ebsc.address);
//         });
//         it("allows airdroping native tokens",async()=>{
//             await airdrops.connect(owner).setEpochDuration(999999999);
//             await admin.connect(owner).addOperator(owner.address);
//             await airdrops.connect(owner).addAirdrop(BN.from("2").mul(BN.from("10").pow("18")),"0x0000000000000000000000000000000000000001",{ value: BN.from("2").mul(BN.from("10").pow("18"))});
//         });
//     });
//     describe("Airdrop collection",async()=>{
//         it("Allows appropriate user to collect",async()=>{
//             await airdrops.connect(owner).setEpochDuration(999999999);
//             await admin.connect(owner).addOperator(owner.address);
//             await ebsc.connect(owner).approve(airdrops.address,BN.from("200000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("2500000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("2500000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[1]).stake(3,BN.from("2500000").mul(BN.from("10").pow("9")));

//             await airdrops.connect(owner).addAirdrop(BN.from("200000").mul(BN.from("10").pow("9")),ebsc.address);
//             await airdrops.connect(accounts[1]).claimAirdrop(accounts[1].address);

//             expect(await ebsc.balanceOf(accounts[1].address)).to.be.eq(200000000000000);

//         });
//         it("Only Allows appropriate user to collect",async()=>{
//             await airdrops.connect(owner).setEpochDuration(999999999);
//             await admin.connect(owner).addOperator(owner.address);
//             await ebsc.connect(owner).approve(airdrops.address,BN.from("200000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("200000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("200000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[1]).stake(2,BN.from("200000").mul(BN.from("10").pow("9")));

//             await airdrops.connect(owner).addAirdrop(BN.from("200000").mul(BN.from("10").pow("9")),ebsc.address);
//             await airdrops.connect(accounts[1]).claimAirdrop(accounts[1].address);
//             expect(await ebsc.balanceOf(accounts[1].address)).to.be.eq(0);
//         });
//         it("Allows natiive token distribution",async()=>{
//             await airdrops.connect(owner).setEpochDuration(999999999);
//             await admin.connect(owner).addOperator(owner.address);

//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("2500000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("2500000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[1]).stake(3,BN.from("2500000").mul(BN.from("10").pow("9")));

//             await airdrops.connect(owner).addAirdrop(BN.from("2").mul(BN.from("10").pow("18")),"0x0000000000000000000000000000000000000001",{ value: BN.from("2").mul(BN.from("10").pow("18"))});
//             let preBal = Number(await ethers.provider.getBalance(accounts[1].address));
//             await airdrops.connect(accounts[1]).claimAirdrop(accounts[1].address);
//             let posBal = Number(await ethers.provider.getBalance(accounts[1].address));
//             await expect(posBal).to.be.greaterThan(preBal);

//         });
//         it("Distributes amount evenly",async()=>{
//             await airdrops.connect(owner).setEpochDuration(999999999);
//             await admin.connect(owner).addOperator(owner.address);
//             await ebsc.connect(owner).approve(airdrops.address,BN.from("200000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("2500000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("2500000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[1]).stake(3,BN.from("2500000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(owner).transfer(accounts[2].address,BN.from("5000000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[2]).approve(staking.address,BN.from("5000000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[2]).stake(3,BN.from("5000000").mul(BN.from("10").pow("9")));

//             await airdrops.connect(owner).addAirdrop(BN.from("200000").mul(BN.from("10").pow("9")),ebsc.address);
//             await airdrops.connect(accounts[1]).claimAirdrop(accounts[1].address);
//             expect(await ebsc.balanceOf(accounts[1].address)).to.be.eq(BN.from("200000").mul(BN.from("10").pow("9")).div("3"));
//         });
//     });
// });