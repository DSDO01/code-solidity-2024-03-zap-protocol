// const { expect } = require("chai");
// const { BigNumber } = require("ethers");
// const { ethers } = require("hardhat");
// const BN = require("ethers").BigNumber;
// const {
//   time, // time
//   constants
// } = require("@openzeppelin/test-helpers");

// describe("Start", async () => {
//   const duration = {
//     seconds(val) {
//       return BN.from(val);
//     },
//     minutes(val) {
//       return BN.from(val).mul(this.seconds("60"));
//     },
//     hours(val) {
//       return new BN.from(val).mul(this.minutes("60"));
//     },
//     days(val) {
//       return new BN.from(val).mul(this.hours("24"));
//     },
//     weeks(val) {
//       return new BN.from(val).mul(this.days("7"));
//     },
//     years(val) {
//       return new BN.from(val).mul(this.days("365"));
//     },
//   };


//   beforeEach(async () => {

//     signers = await ethers.getSigners();
//     owner = signers[0];

//     provider = ethers.provider;

//     Admin = await ethers.getContractFactory("Admin");
//     TokenSale = await ethers.getContractFactory("TokenSale");
//     LpToken = await ethers.getContractFactory("LPToken");
//     Staking = await ethers.getContractFactory("Staking");
//     Oracle = await ethers.getContractFactory("ChainLink");
//     // Airdrops = await ethers.getContractFactory("Airdrops");

//     lpToken = await LpToken.deploy("LPToken", "lptkn");
//     await lpToken.deployed();

//     adminContract = await Admin.deploy();
//     await adminContract.deployed();

//     tokenSaleContract = await TokenSale.deploy();
//     await tokenSaleContract.deployed();

//     oracle = await Oracle.deploy();
//     await oracle.deployed();

//     stakingContract = await Staking.deploy(lpToken.address, adminContract.address);
//     await stakingContract.deployed();

//     await adminContract.addOperator(owner.address);
//     await adminContract.setMasterContract(tokenSaleContract.address);
//     await adminContract.setOracleContract(oracle.address);
//     await adminContract.setStakingContract(stakingContract.address);

//     // await stakingContract.initialize(_params,stakingContract.address, adminContract.address,oracle.address);
//   })

//   describe("Token Sale", async () => {
//     it("Gift Tier", async () => {
//       const now = (await time.latest()).toNumber();
//       const end = BN.from(now).add(duration.hours(5));
//       params = {
//         initial: owner.address,
//         token: lpToken.address,
//         totalSupply: ethers.utils.parseEther("50"), // MUST BE 10**18;
//         privateStart: BN.from(now).add(duration.hours(1)),
//         privateEnd: end,
//         publicStart: BN.from(now).add(duration.hours(6)),
//         publicEnd: BN.from(now).add(duration.hours(11)),
//         privateTokenPrice: BigNumber.from(2), // MUST BE 10**18 in $
//         publicTokenPrice: BigNumber.from(6), // MUST BE 10**18 in $
//         publicBuyLimit: ethers.utils.parseEther("1"), // LIKE ERC20
//         escrowPercentage: BigNumber.from(600),
//         tierPrices: [BigNumber.from('100'),
//         BigNumber.from('200'),
//         BigNumber.from('300'),
//         BigNumber.from('400')],
//         escrowReturnMilestones: [
//           [BigNumber.from('300'), BigNumber.from('600')],
//           [BigNumber.from('900'), BigNumber.from('200')],
//           [BigNumber.from('600'), BigNumber.from('200')],
//         ],
//         thresholdPublicAmount: BigNumber.from("15"),
//         claimTime: BigNumber.from('10'),
//         claimPct: BigNumber.from('300'),
//         airdrop: BigNumber.from('2')
//       };

//       await tokenSaleContract.connect(owner).initialize(params, stakingContract.address, adminContract.address, oracle.address);
//       await adminContract.addOperator(owner.address);

//       // await tokenSaleContract.giftTier(addr,no);
//       await tokenSaleContract.connect(owner).giftTier([owner.address], ["3"]);
//       await adminContract.hasRole("0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c", owner.address);
//       const hashop = await adminContract.hasRole("0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c", owner.address);
//       console.log("Checking operator", hashop);
//     });
//   });
//   describe("Deposit", async () => {
//     it("Deposit", async () => {

//       console.log("Before mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.mint(owner.address, BN.from("1000000000").mul(BN.from("10").pow("18"))); //MINTING FOR STAKING

//       console.log("After Mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.connect(owner).approve(stakingContract.address, BN.from("1000000000").mul(BN.from("10").pow("18")));//APPROVING FOR STAKING

//       await stakingContract.stake(BN.from("200000").mul(BN.from("10").pow("9")));

//       await lpToken.mint(owner.address, ethers.utils.parseEther("5000"));//MINTING FOR CREATEPOOL


//       await lpToken.connect(owner).approve(adminContract.address, ethers.utils.parseEther("1500"));//APPROVING FOR CREATEPOOL
//       await adminContract.addOperator(owner.address);

//       const now = (await time.latest()).toNumber();
//       const end = BN.from(now).add(duration.seconds(45));

//       const xyz = await adminContract.connect(owner).createPool(
//         params = {
//           initial: owner.address,
//           token: lpToken.address,
//           totalSupply: BN.from("1000").mul(BN.from("10").pow("18")), // MUST BE 10**18;
//           privateStart: BN.from(now).add(duration.seconds(7)),
//           privateEnd: end,
//           publicStart: BN.from(now).add(duration.minutes(1)),
//           publicEnd: BN.from(now).add(duration.minutes(2)),
//           privateTokenPrice: BN.from("200").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicTokenPrice: BN.from("500").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicBuyLimit: ethers.utils.parseEther("600"), // LIKE ERC20
//           escrowPercentage: BigNumber.from(50),
//           tierPrices: [BigNumber.from('100'),
//           BigNumber.from('200'),
//           BigNumber.from('300'),
//           BigNumber.from('400')],
//           escrowReturnMilestones: [
//             [BigNumber.from(30), BigNumber.from(60)],
//             [BigNumber.from(50), BigNumber.from(40)],
//             [BigNumber.from(50), BigNumber.from(40)],
//           ],
//           thresholdPublicAmount: BigNumber.from("15"),
//           claimTime: BN.from(now).add(duration.hours(5)),
//           claimPct: BigNumber.from('300'),
//           airdrop: BigNumber.from('2')
//         });
//       const receipt = await xyz.wait();
//       const event = receipt.events.filter((x) => x.event === "CreateTokenSale");

//       defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
//       async function sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//       }
//       await defaultInstance.connect(owner).giftTier([owner.address], [3]);
//       await sleep(9000).then(async () => {
//         await defaultInstance.deposit({ value: 999 });
//       })
//       console.log("Deposit Tier", await stakingContract.getTierOf(owner.address));


//     });
//     // it("Only giftTier users", async () => {

//     //   console.log("Before mint", Number(await lpToken.balanceOf(owner.address)));
//     //   await lpToken.mint(owner.address, BN.from("1000000000").mul(BN.from("10").pow("18"))); //MINTING FOR STAKING

//     //   console.log("After Mint", Number(await lpToken.balanceOf(owner.address)));
//     //   await lpToken.connect(owner).approve(stakingContract.address, BN.from("1000000000").mul(BN.from("10").pow("18")));//APPROVING FOR STAKING

//     //   await stakingContract.stake(BN.from("200000").mul(BN.from("10").pow("9")));

//     //   await lpToken.mint(owner.address, ethers.utils.parseEther("5000"));//MINTING FOR CREATEPOOL


//     //   await lpToken.connect(owner).approve(adminContract.address, ethers.utils.parseEther("1500"));//APPROVING FOR CREATEPOOL
//     //   await adminContract.addOperator(owner.address);


//     //   const now = (await time.latest()).toNumber();
//     //   const end = BN.from(now).add(duration.seconds(45));

//     //   const xyz = await adminContract.connect(owner).createPool(
//     //     params = {
//     //       initial: owner.address,
//     //       token: lpToken.address,
//     //       totalSupply: BN.from("1000").mul(BN.from("10").pow("18")), // MUST BE 10**18;
//     //       privateStart: BN.from(now).add(duration.seconds(15)),
//     //       privateEnd: end,
//     //       publicStart: BN.from(now).add(duration.minutes(1)),
//     //       publicEnd: BN.from(now).add(duration.minutes(2)),
//     //       privateTokenPrice: BN.from("200").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//     //       publicTokenPrice: BN.from("500").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//     //       publicBuyLimit: ethers.utils.parseEther("600"), // LIKE ERC20
//     //       escrowPercentage: BigNumber.from(50),
//     //       tierPrices: [BigNumber.from('100'),
//     //       BigNumber.from('200'),
//     //       BigNumber.from('300'),
//     //       BigNumber.from('400')],
//     //       escrowReturnMilestones: [
//     //         [BigNumber.from(30), BigNumber.from(60)],
//     //         [BigNumber.from(50), BigNumber.from(40)],
//     //         [BigNumber.from(50), BigNumber.from(40)],
//     //       ],
//     //       thresholdPublicAmount: BigNumber.from("15"),
//     //       claimTime: BN.from(now).add(duration.hours(5)),
//     //       claimPct: BigNumber.from('300'),
//     //       airdrop: BigNumber.from('2')
//     //     });
//     //   const receipt = await xyz.wait();
//     //   const event = receipt.events.filter((x) => x.event === "CreateTokenSale");

//     //   defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
//     //   async function sleep(ms) {
//     //     return new Promise(resolve => setTimeout(resolve, ms));
//     //   }

//       ///////GIFTING TIER/////
//       await defaultInstance.connect(owner).giftTier([owner.address], [3]);
//       await tokenSaleContract.connect(owner).initialize(params, stakingContract.address, adminContract.address, oracle.address);
//       await adminContract.addOperator(owner.address);
//       console.log("Tier after gift", await stakingContract.getTierOf(owner.address));
//       await defaultInstance.onlygiftTier(true);
//       await sleep(15000).then(async () => {
//       })
//       console.log("Deposit Tier", await stakingContract.getTierOf(owner.address));
//       await defaultInstance.deposit({ value: 999 });

//     });

//     it("onlygiftTier without giftTier", async () => {
//       console.log("Before mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.mint(owner.address, BN.from("1000000000").mul(BN.from("10").pow("18"))); //MINTING FOR STAKING

//       console.log("After Mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.connect(owner).approve(stakingContract.address, BN.from("1000000000").mul(BN.from("10").pow("18")));//APPROVING FOR STAKING

//       await stakingContract.stake(BN.from("800000").mul(BN.from("10").pow("9")));

//       await lpToken.mint(owner.address, ethers.utils.parseEther("5000"));//MINTING FOR CREATEPOOL


//       await lpToken.connect(owner).approve(adminContract.address, ethers.utils.parseEther("1500"));//APPROVING FOR CREATEPOOL
//       await adminContract.addOperator(owner.address);


//       const now = (await time.latest()).toNumber();
//       const end = BN.from(now).add(duration.seconds(45));

//       const xyz = await adminContract.connect(owner).createPool(
//         params = {
//           initial: owner.address,
//           token: lpToken.address,
//           totalSupply: BN.from("1000").mul(BN.from("10").pow("18")), // MUST BE 10**18;
//           privateStart: BN.from(now).add(duration.seconds(15)),
//           privateEnd: end,
//           publicStart: BN.from(now).add(duration.minutes(1)),
//           publicEnd: BN.from(now).add(duration.minutes(2)),
//           privateTokenPrice: BN.from("200").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicTokenPrice: BN.from("500").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicBuyLimit: ethers.utils.parseEther("600"), // LIKE ERC20
//           escrowPercentage: BigNumber.from(50),
//           tierPrices: [BigNumber.from('100'),
//           BigNumber.from('200'),
//           BigNumber.from('300'),
//           BigNumber.from('400')],
//           escrowReturnMilestones: [
//             [BigNumber.from(30), BigNumber.from(60)],
//             [BigNumber.from(50), BigNumber.from(40)],
//             [BigNumber.from(50), BigNumber.from(40)],
//           ],
//           thresholdPublicAmount: BigNumber.from("15"),
//           claimTime: BN.from(now).add(duration.hours(5)),
//           claimPct: BigNumber.from('300'),
//           airdrop: BigNumber.from('2')
//         });
//       const receipt = await xyz.wait();
//       const event = receipt.events.filter((x) => x.event === "CreateTokenSale");

//       defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
//       async function sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//       }
//       // await defaultInstance.connect(owner).giftTier([owner.address], [3])
//       await tokenSaleContract.connect(owner).initialize(params, stakingContract.address, adminContract.address, oracle.address);
//       await adminContract.addOperator(owner.address);

//       console.log("Tier =", await stakingContract.getTierOf(owner.address));
//       await defaultInstance.onlygiftTier(true);
//       await sleep(15000).then(async () => {
//       })
//     await expect (defaultInstance.deposit({ value: 999 })).to.be.revertedWith("no tier");

//     });
//     it("onlygiftTier without staking", async () => {

//       console.log("Before mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.mint(owner.address, BN.from("1000000000").mul(BN.from("10").pow("18"))); //MINTING FOR STAKING

//       console.log("After Mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.connect(owner).approve(stakingContract.address, BN.from("1000000000").mul(BN.from("10").pow("18")));//APPROVING FOR STAKING

//       // await stakingContract.stake(BN.from("200000").mul(BN.from("10").pow("9")));

//       await lpToken.mint(owner.address, ethers.utils.parseEther("5000"));//MINTING FOR CREATEPOOL


//       await lpToken.connect(owner).approve(adminContract.address, ethers.utils.parseEther("1500"));//APPROVING FOR CREATEPOOL
//       await adminContract.addOperator(owner.address);

//       const now = (await time.latest()).toNumber();
//       const end = BN.from(now).add(duration.seconds(45));

//       const xyz = await adminContract.connect(owner).createPool(
//         params = {
//           initial: owner.address,
//           token: lpToken.address,
//           totalSupply: BN.from("1000").mul(BN.from("10").pow("18")), // MUST BE 10**18;
//           privateStart: BN.from(now).add(duration.seconds(15)),
//           privateEnd: end,
//           publicStart: BN.from(now).add(duration.minutes(1)),
//           publicEnd: BN.from(now).add(duration.minutes(2)),
//           privateTokenPrice: BN.from("200").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicTokenPrice: BN.from("500").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicBuyLimit: ethers.utils.parseEther("600"), // LIKE ERC20
//           escrowPercentage: BigNumber.from(50),
//           tierPrices: [BigNumber.from('100'),
//           BigNumber.from('200'),
//           BigNumber.from('300'),
//           BigNumber.from('400')],
//           escrowReturnMilestones: [
//             [BigNumber.from(30), BigNumber.from(60)],
//             [BigNumber.from(50), BigNumber.from(40)],
//             [BigNumber.from(50), BigNumber.from(40)],
//           ],
//           thresholdPublicAmount: BigNumber.from("15"),
//           claimTime: BN.from(now).add(duration.hours(5)),
//           claimPct: BigNumber.from('300'),
//           airdrop: BigNumber.from('2')
//         });
//       const receipt = await xyz.wait();
//       const event = receipt.events.filter((x) => x.event === "CreateTokenSale");

//       defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
//       async function sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//       }

//       ///////GIFTING TIER/////
//       await defaultInstance.connect(owner).giftTier([owner.address], [3]);
//       await tokenSaleContract.connect(owner).initialize(params, stakingContract.address, adminContract.address, oracle.address);
//       await adminContract.addOperator(owner.address);
      
//       console.log("Tier after gift", await stakingContract.getTierOf(owner.address));
//       await defaultInstance.onlygiftTier(true);
//       await sleep(15000).then(async () => {
//       })
//       console.log("Deposit Tier", await stakingContract.getTierOf(owner.address));
//       // await defaultInstance.deposit({ value: 999 });

//     })
//     it("Should revert with message Incorrect time", async () => {

//       console.log("Before mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.mint(owner.address, BN.from("1000000000").mul(BN.from("10").pow("18"))); //MINTING FOR STAKING

//       console.log("After Mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.connect(owner).approve(stakingContract.address, BN.from("1000000000").mul(BN.from("10").pow("18")));//APPROVING FOR STAKING

//       await stakingContract.stake(BN.from("200000").mul(BN.from("10").pow("9")));

//       await lpToken.mint(owner.address, ethers.utils.parseEther("5000"));//MINTING FOR CREATEPOOL

//       await lpToken.connect(owner).approve(adminContract.address, ethers.utils.parseEther("1500"));//APPROVING FOR CREATEPOOL
//       await adminContract.addOperator(owner.address);

//       const now = (await time.latest()).toNumber();
//       const end = BN.from(now).add(duration.seconds(45));

//       const xyz = await adminContract.connect(owner).createPool(
//         params = {
//           initial: owner.address,
//           token: lpToken.address,
//           totalSupply: BN.from("1000").mul(BN.from("10").pow("18")), // MUST BE 10**18;
//           privateStart: BN.from(now).add(duration.seconds(3)),
//           privateEnd: end,
//           publicStart: BN.from(now).add(duration.minutes(1)),
//           publicEnd: BN.from(now).add(duration.minutes(2)),
//           privateTokenPrice: BN.from("200").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicTokenPrice: BN.from("500").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicBuyLimit: ethers.utils.parseEther("600"), // LIKE ERC20
//           escrowPercentage: BigNumber.from(50),
//           tierPrices: [BigNumber.from('100'),
//           BigNumber.from('200'),
//           BigNumber.from('300'),
//           BigNumber.from('400')],
//           escrowReturnMilestones: [
//             [BigNumber.from(30), BigNumber.from(60)],
//             [BigNumber.from(50), BigNumber.from(40)],
//             [BigNumber.from(50), BigNumber.from(40)],
//           ],
//           thresholdPublicAmount: BigNumber.from("15"),
//           claimTime: BN.from(now).add(duration.hours(5)),
//           claimPct: BigNumber.from('300'),
//           airdrop: BigNumber.from('2')
//         });
//       const receipt = await xyz.wait();
//       const event = receipt.events.filter((x) => x.event === "CreateTokenSale");

//       defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
//       async function sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//       }

//       ///////GIFTING TIER/////
//       await defaultInstance.connect(owner).giftTier([owner.address], [3]);
//       await tokenSaleContract.connect(owner).initialize(params, stakingContract.address, adminContract.address, oracle.address);
//       await adminContract.addOperator(owner.address);
      
//       console.log("Tier after gift", await stakingContract.getTierOf(owner.address));

//       await expect(defaultInstance.onlygiftTier(true)).to.be.revertedWith("Incorrect time");
//       await sleep(15000).then(async () => {
//       })
//       console.log("Deposit Tier", await stakingContract.getTierOf(owner.address));

//       await defaultInstance.deposit({ value: 999 });

//     });
//     it("Should revert with message Does not have a tier", async () => {

//       console.log("Before mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.mint(owner.address, BN.from("1000000000").mul(BN.from("10").pow("18"))); //MINTING FOR STAKING

//       console.log("After Mint", Number(await lpToken.balanceOf(owner.address)));
//       await lpToken.connect(owner).approve(stakingContract.address, BN.from("1000000000").mul(BN.from("10").pow("18")));//APPROVING FOR STAKING

//       // await stakingContract.stake(BN.from("200000").mul(BN.from("10").pow("9")));
//       console.log("Tier before deposit", await stakingContract.getTierOf(stakingContract.address));

//       await lpToken.mint(owner.address, ethers.utils.parseEther("5000"));//MINTING FOR CREATEPOOL


//       await lpToken.connect(owner).approve(adminContract.address, ethers.utils.parseEther("1500"));//APPROVING FOR CREATEPOOL
//       await adminContract.addOperator(owner.address);


//       const now = (await time.latest()).toNumber();
//       const end = BN.from(now).add(duration.seconds(45));

//       const xyz = await adminContract.connect(owner).createPool(
//         params = {
//           initial: owner.address,
//           token: lpToken.address,
//           totalSupply: BN.from("1000").mul(BN.from("10").pow("18")), // MUST BE 10**18;
//           privateStart: BN.from(now).add(duration.seconds(7)),
//           privateEnd: end,
//           publicStart: BN.from(now).add(duration.minutes(1)),
//           publicEnd: BN.from(now).add(duration.minutes(2)),
//           privateTokenPrice: BN.from("200").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicTokenPrice: BN.from("500").mul(BN.from("10").pow("18")), // MUST BE 10**18 in $
//           publicBuyLimit: ethers.utils.parseEther("600"), // LIKE ERC20
//           escrowPercentage: BigNumber.from(50),
//           tierPrices: [BigNumber.from('100'),
//           BigNumber.from('200'),
//           BigNumber.from('300'),
//           BigNumber.from('400')],
//           escrowReturnMilestones: [
//             [BigNumber.from(30), BigNumber.from(60)],
//             [BigNumber.from(50), BigNumber.from(40)],
//             [BigNumber.from(50), BigNumber.from(40)],
//           ],
//           thresholdPublicAmount: BigNumber.from("15"),
//           claimTime: BN.from(now).add(duration.hours(5)),
//           claimPct: BigNumber.from('300'),
//           airdrop: BigNumber.from('2')
//         });
//       const receipt = await xyz.wait();
//       const event = receipt.events.filter((x) => x.event === "CreateTokenSale");

//       defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
//       async function sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//       }


//       ///////GIFTING TIER/////

//       // await defaultInstance.connect(owner).giftTier([owner.address], [3]);
//       await tokenSaleContract.connect(owner).initialize(params, stakingContract.address, adminContract.address, oracle.address);
//       await adminContract.addOperator(owner.address);
//       console.log(await tokenSaleContract.tokensaleTiers(owner.address));
//       console.log("Tier after gift", await stakingContract.getTierOf(owner.address));

//       await defaultInstance.onlygiftTier(true);
//       await sleep(15000).then(async () => {

//       })
//       console.log(Number(await ethers.provider.getBalance(defaultInstance.address)));
//       console.log("Deposit Tier", await stakingContract.getTierOf(owner.address));
//       await expect(defaultInstance.deposit({ value: 999 })).to.be.revertedWith("no tier");

//     });

//   });

// });
