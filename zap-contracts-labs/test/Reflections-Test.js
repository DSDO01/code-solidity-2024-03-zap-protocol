// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;

// describe.only("Reflections",async()=>{
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

//         airdrops = await Airdrops.deploy(staking.address, admin.address, ebsc.address);
//         await airdrops.deployed();

//         let EBSC_REQ = [[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000,30000000]];
//         staking.initialize(ebsc.address,admin.address,router.address,weth.address,EBSC_REQ);

//         await admin.setAirdrop(airdrops.address);
//         await ebsc.excludeFromFee(staking.address);
//         await ebsc.excludeFromFee(airdrops.address);
//         await ebsc.connect(owner).setTaxFeePercent(8);

//         await airdrops.connect(owner).setEpoch();
//         await airdrops.connect(owner).setEpochDuration(BN.from("999999").mul(BN.from("10").pow("9")));
//     });

//     describe("Reflection collection",async()=>{
//         it("Doesn't distributes reflection to account with no balance",async()=>{
//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("200000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).transfer(accounts[2].address,BN.from("200000").mul(BN.from("10").pow("9")));

//             // no reflection from transaction will be sent back.
//             expect (await ebsc.balanceOf(accounts[1].address)).to.be.eq(0);  

//         });
//         it("No Reflection on stake",async()=>{
//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("600000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("600000").mul(BN.from("10").pow("9")));

//             let iniOwnerBal = await ebsc.balanceOf(owner.address);
//             let ini1Bal = await ebsc.balanceOf(accounts[1].address);

//             expect (await ebsc.balanceOf(owner.address)).to.be.eq(BN.from("4999400000").mul(BN.from("10").pow("9")));
//             expect (await ebsc.balanceOf(accounts[1].address)).to.be.eq(BN.from("600000").mul(BN.from("10").pow("9")));

//             let stake_amount = BN.from("200000").mul(BN.from("10").pow("9"));
//             await staking.connect(accounts[1]).stake(3,stake_amount);

//             let finOwnerBal = await ebsc.balanceOf(owner.address);
//             let fin1Bal = await await ebsc.balanceOf(accounts[1].address);

//             let reflectionOnOwner = finOwnerBal - iniOwnerBal;
//             let finReflectionNstake = fin1Bal.add(stake_amount);
//             let reflectionOn1 = finReflectionNstake - ini1Bal;

//             let totalReflection = reflectionOnOwner + reflectionOn1;

//             expect (await totalReflection).to.be.eq(0);
//             // Total reflection is zero for staking.
//         });
//         it("Implements reflections on transfers",async()=>{
//             expect(await ebsc.balanceOf(accounts[1].address)).to.be.eq(0);
//             expect(await ebsc.balanceOf(accounts[2].address)).to.be.eq(0);
//             expect(await ebsc.balanceOf(owner.address)).to.be.eq(BN.from("5000000000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("500000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(owner).transfer(accounts[2].address,BN.from("500000").mul(BN.from("10").pow("9")));

//             let iniOwnerBal = await ebsc.balanceOf(owner.address);
//             let ini1Bal = await ebsc.balanceOf(accounts[1].address);
//             let ini2Bal = await ebsc.balanceOf(accounts[2].address);

//             let transfer_amount = await BN.from("100000").mul(BN.from("10").pow("9"));
//             await ebsc.connect(accounts[1]).transfer(accounts[2].address,transfer_amount);

//             let finOwnerBal = await ebsc.balanceOf(owner.address);
//             let fin1Bal = await ebsc.balanceOf(accounts[1].address);
//             let fin2Bal = await ebsc.balanceOf(accounts[2].address);

//             let reflectionOnOwner = await finOwnerBal.sub(iniOwnerBal);
//             let reflectionOn1 = await (fin1Bal.add(transfer_amount)).sub(ini1Bal);
//             let tfrNrefon2 = await (fin2Bal.sub(ini2Bal));  
//             let reflectionOn2 = await (tfrNrefon2.sub(BN.from("92000").mul(BN.from("10").pow("9")))); //Subtracting the transfered value (92%)

//             expect(await reflectionOnOwner).to.be.eq(7998412797460);//Reflection on owner account.
//             expect(await reflectionOn1).to.be.eq(640001024);//Reflections on account 1.
//             expect(await reflectionOn2).to.be.eq(947201515);//Reflections on account 2.
//             //Totalling up to 7999999999999.
//             //8000000000000 being the total reflection.
//         });
//         it("No Reflection for no-lockperiod users",async()=>{
//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("800000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("800000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(owner).approve(router.address,BN.from("800000").mul(BN.from("10").pow("9")));

//             await router.connect(owner).addLiquidityETH(ebsc.address,BN.from("100000").mul(BN.from("10").pow("9")),1,1, 
//             owner.address, 991657284960, { value: BN.from("1").mul(BN.from("10").pow("18"))});

//             const [,bnb] = await router. getAmountsOut(BN.from("40000").mul(BN.from("10").pow("9")),[ebsc.address,weth.address]);
//             await staking.connect(accounts[1]).stake(1,BN.from("800000").mul(BN.from("10").pow("9")) , {value :BN.from(bnb)});

//             await ebsc.connect(owner).transfer(accounts[2].address,BN.from("200000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[2]).transfer(accounts[3].address,BN.from("100000").mul(BN.from("10").pow("9")));

//             //A user at level 1 will not get any transfer reflections
//             expect(await ebsc.balanceOf(accounts[1].address)).to.be.eq(0);
//         });
//         it("Distribution through staking contract",async()=>{
//             await admin.connect(owner).addOperator(owner.address);
//             await airdrops.setMarketingWallet(accounts[10].address);

//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("1000000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(owner).transfer(accounts[4].address,BN.from("3000000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("1000000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[1]).stake(3,BN.from("1000000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(accounts[4]).approve(staking.address,BN.from("3000000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[4]).stake(3,BN.from("3000000").mul(BN.from("10").pow("9")));

//             await ebsc.connect(owner).transfer(accounts[2].address,BN.from("2000000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[2]).transfer(accounts[3].address,BN.from("2000000").mul(BN.from("10").pow("9")));

//             let sbamt = Number(await staking.getReflection());

//             await ebsc.connect(owner).transfer(accounts[10].address,sbamt);
//             await ebsc.connect(accounts[10]).approve(airdrops.address,sbamt);

//             await staking.transferReflection(sbamt);
            
//             await ebsc.connect(owner).transfer(airdrops.address,sbamt);
//             sbamt *= 2;
//             await airdrops.distributionEBSC(sbamt);
//             await airdrops.connect(accounts[1]).claimEBSC();
//             await airdrops.connect(accounts[4]).claimEBSC();

//             expect (await ebsc.balanceOf(accounts[1].address)).to.be.eq(96003072098);
//         });
//         it("Can withHold pending reflections",async()=>{
//             await admin.connect(owner).addOperator(owner.address);
//             await airdrops.setMarketingWallet(accounts[10].address);
//             await ebsc.connect(owner).transfer(accounts[1].address,BN.from("1000000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[1]).approve(staking.address,BN.from("1000000").mul(BN.from("10").pow("9")));
//             await staking.connect(accounts[1]).stake(3,BN.from("1000000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(owner).transfer(accounts[2].address,BN.from("2000000").mul(BN.from("10").pow("9")));
//             await ebsc.connect(accounts[2]).transfer(accounts[3].address,BN.from("2000000").mul(BN.from("10").pow("9")));
//             let samt = await staking.getReflection();
//             await ebsc.connect(owner).transfer(accounts[10].address,samt);
//             await ebsc.connect(accounts[10]).approve(airdrops.address,samt);
//             await staking.transferReflection(samt);

//             await airdrops.distributionEBSC(samt);

//             await ethers.provider.send("evm_increaseTime", [31556926]);
//             await ethers.provider.send("evm_mine");

//             await staking.connect(accounts[1]).unstake(BN.from("1000000").mul(BN.from("10").pow("9"))); 

//             await airdrops.connect(accounts[1]).claimEBSC();
//         });
        
//     });
    
// });