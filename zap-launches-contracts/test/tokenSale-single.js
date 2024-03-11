// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// // const {mineBlocks} = require("../../launchpad-contracts/test/utilities/utilities");

// const {
//   time, // time
//   constants,
// } = require("@openzeppelin/test-helpers");

// const BN = require("ethers").BigNumber;

// const duration = {
//   seconds(val) {
//     return BN.from(val);
//   },
//   minutes(val) {
//     return BN.from(val).mul(this.seconds("60"));
//   },
//   hours(val) {
//     return new BN.from(val).mul(this.minutes("60"));
//   },
//   days(val) {
//     return new BN.from(val).mul(this.hours("24"));
//   },
//   weeks(val) {
//     return new BN.from(val).mul(this.days("7"));
//   },
//   years(val) {
//     return new BN.from(val).mul(this.days("365"));
//   },
// };

// describe("TokenSale Contract", () => {
//   beforeEach(async () => {
//     Admin = await ethers.getContractFactory("Admin");
//     TokenSale = await ethers.getContractFactory("TokenSale");
//     Token = await ethers.getContractFactory("Token");
//     LpToken = await ethers.getContractFactory("Token");
//     TokenBUSD = await ethers.getContractFactory("Token");
//     Staking = await ethers.getContractFactory("Staking");
//     Oracle = await ethers.getContractFactory("ChainLink");
//     Airdrops = await ethers.getContractFactory("Rewards");
//     Weth = await ethers.getContractFactory("WETH");
//     Pair = await ethers.getContractFactory("UniswapV2Pair");
//     Factory = await ethers.getContractFactory("UniswapV2Factory");
//     Router = await ethers.getContractFactory("UniswapV2Router01");
//     [owner] = await ethers.getSigners();
//     accounts = await ethers.getSigners();
//     provider = await ethers.provider;
//     hash = await ethers.getContractFactory("CalHash");
//     ebsc = await ethers.getContractFactory("EBSC");

//     hashReq = await hash.deploy();
//     await hashReq.deployed();

//     const getHash = await hashReq.getInitHash();
//     console.log("getHash", getHash);

//     tokenSaleContract = await TokenSale.deploy();
//     await tokenSaleContract.deployed();

//     oracle = await Oracle.deploy();
//     await oracle.deployed();

//     factory = await Factory.deploy(owner.address);
//     await factory.deployed();

//     weth = await Weth.deploy();
//     await weth.deployed();

//     router = await Router.deploy(factory.address, weth.address);
//     await router.deployed();

//     token = await Token.deploy("Token", "tkn"); // Token for IDO
//     await token.deployed();

//     tokenBUSD = await TokenBUSD.deploy("TokenBUSD", "TBUSD");
//     await tokenBUSD.deployed();

//     lpToken = await ebsc.deploy(router.address); // for staking(EBSC)
//     await lpToken.deployed();

//     adminContract = await Admin.deploy();
//     await adminContract.deployed();
//     await adminContract.initialize(owner.address);

//     const EbscReq = [
//       [200000, 600000, 1000000, 2500000, 5000000, 7000000],
//       [200000, 600000, 1000000, 2500000, 5000000, 7000000],
//       [200000, 600000, 1000000, 2500000, 5000000, 7000000],
//       [200000, 600000, 1000000, 2500000, 5000000, 7000000, 30000000],
//     ];
//     stakingContract = await Staking.deploy();
//     await stakingContract.deployed();

//     await stakingContract.initialize(
//       lpToken.address,
//       adminContract.address,
//       router.address,
//       weth.address,
//       EbscReq
//     );

//     airdrops = await Airdrops.deploy();
//     await airdrops.deployed();
//     await airdrops.initialize(
//       stakingContract.address,
//       adminContract.address,
//       lpToken.address
//     );

//     await adminContract.addOperator(owner.address);
//     await adminContract.setMasterContract(tokenSaleContract.address);
//     await adminContract.setStakingContract(stakingContract.address);
//     await adminContract.setAirdrop(airdrops.address);

//     await adminContract.addOperator(owner.address);
//     // console.log("operator hash", await adminContract.OPERATOR);

//     const newAuuurray = [
//       [15, 75, 150, 350, 750, 1125],
//       [30, 115, 225, 550, 1125, 1650],
//       [60, 225, 350, 825, 1650, 2350],
//       [200, 600, 850, 1650, 2350, 3000, 7500],
//     ];

//     //   console.log("role check:", await adminContract.hasRole(
//     //     "0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c",
//     //     owner.address
//     //   ));

//     await stakingContract.setAllocations(newAuuurray);
//     // await tokenSaleContract.setBUSD(tokenBUSD.address);
//     console.log("busd address", tokenBUSD.address);
//     // await lpToken.mint(owner.address, BN.from("600000000").mul(BN.from("10").pow("18")));
//     // console.log("lpToken5ytyttr balance", String(await lpToken.balanceOf(owner.address)));
//     await lpToken
//       .connect(owner)
//       .approve(
//         stakingContract.address,
//         BN.from("600000000").mul(BN.from("10").pow("18"))
//       );

//     // await lpToken
//     //   .connect(owner)
//     //   .transfer(
//     //     accounts[0].address,
//     //     BN.from("2500000").mul(BN.from("10").pow("9"))
//     //   );

//     console.log(
//       "account 0 balance ",
//       String(await lpToken.balanceOf(accounts[0].address))
//     );

//     await lpToken
//       .connect(owner)
//       .approve(
//         router.address,
//         BN.from("600000000").mul(BN.from("10").pow("18"))
//       );
//     // await lpToken.connect(owner).approve(airdrops.address, BN.from("600000000").mul(BN.from("10").pow("18")));
//     await router
//       .connect(owner)
//       .addLiquidityETH(
//         lpToken.address,
//         BN.from("100").mul(BN.from("10").pow("9")),
//         1,
//         1,
//         owner.address,
//         1675748851,
//         { value: BN.from("10").mul(BN.from("10").pow("18")) }
//       );

//     // const pairAddress = factory.getPair(lpToken.address, )
//     // console.log("pair address", factory.getPair())
//     //console.log("bnb - airdrop initial ", String (await weth.balanceOf(airdrops.address)));

//     console.log(
//       "Balance of owner before staking ",
//       String(await lpToken.balanceOf(owner.address))
//     );

//     console.log("caller", owner.address);

//     await stakingContract
//       .connect(owner)
//       .stake(2, BN.from("600000").mul(BN.from("10").pow("9")));
//     const gettingAlloc = await stakingContract.getAllocationOf(owner.address);

//     console.log("Allocation :----------", String(await stakingContract.getAllocationOf(owner.address)));
//     await stakingContract
//       .connect(owner)
//       .stake(2, BN.from("2100000").mul(BN.from("10").pow("9")));
//     const gettingAllocc = await stakingContract.getAllocationOf(owner.address);


//     console.log("Allocation :----------", String(await stakingContract.getAllocationOf(owner.address)));



//     console.log("ebsc owner balance", String(await lpToken.balanceOf(owner.address)));

//     // await stakingContract.connect(owner).unstake();

//     console.log("ebsc owner balance", String(await lpToken.balanceOf(owner.address)));


//     // await token.mint(
//     //   owner.address,
//     //   BN.from("6000").mul(BN.from("10").pow("18"))
//     // );
//     await tokenBUSD.mint(
//       owner.address,
//       BN.from("115").mul(BN.from("10").pow("18"))
//     );

//     console.log("busd address", tokenBUSD.address);

//     await token.approve(
//       airdrops.address,
//       BN.from("250000000").mul(BN.from("10").pow("18"))
//     );

//     console.log("----------");

//     console.log(
//       "owner ido token bal",
//       String(await token.balanceOf(owner.address))
//     );
//     await token
//       .connect(owner)
//       .approve(
//         adminContract.address,
//         BN.from("200000").mul(BN.from("10").pow("18"))
//       );

//     now = (await time.latest()).toNumber();
//     const newNow = BN.from(now).add(duration.seconds(6));
//     end = BN.from(now).add(duration.seconds(400));

//     const newPublicNow = BN.from(newNow).add(duration.seconds(16));
//     const newPublicEnd = BN.from(newPublicNow).add(duration.seconds(04));

//     // const newDtae = new Date();
//     // const upTime = parseInt(newDtae.getTime()/1000);
//     // const updatedTime = upTime+60;
//     //   console.log("updatedTime", updatedTime);

//     defaultParams = {
//       totalSupply: BN.from("300").mul(BN.from("10").pow("18")),
//       privateStart: String(newNow),
//       privateTokenPrice: BN.from("1").mul(BN.from("10").pow("18")),
//       privateEnd: String(end),
//     };
//     console.log("time now", now);
//     console.log("private start: ", String(newNow));
//     console.log("private end: ", String(end));
//     // console.log("public start", String(newPublicNow))
//     // console.log("public end", String(newPublicEnd))

//     // await adminContract.createPool(defaultParams);
//     const tx = await adminContract.createPool(defaultParams);
//     console.log("created pool");
//     const receipt = await tx.wait();
//     const event = receipt.events.filter((x) => x.event === "CreateTokenSale");
//     defaultInstance = TokenSale.attach(event[0].args.instanceAddress);

//     console.log("get Params", String(await adminContract.getParams(defaultInstance.address)));

//     // return event[0].args.instanceAddress;
//     await adminContract.setMasterContract(tokenSaleContract.address);
//     await adminContract.setStakingContract(stakingContract.address);

//     // await defaultInstance.giftTier([accounts[0]], [3]);



//     console.log(
//       "owner ido token bal after creating ido",
//       String(await token.balanceOf(owner.address))
//     );
//     console.log(
//       "tokensale ido token bal",
//       String(await token.balanceOf(defaultInstance.address))
//     );

//     await tokenBUSD
//       .connect(owner)
//       .approve(
//         defaultInstance.address,
//         BN.from("20000000000").mul(BN.from("10").pow("18"))
//       );

//     // console.log("bal before deposit", String(await token.balanceOf(defaultInstance.address)));

//     const gettingState = await defaultInstance.getState();
//     console.log("get state before ", String(gettingState));
//   });

//   describe("DEPOSIT", async () => {
//     it.only("deposit ", async () => {
//       async function sleep(ms) {
//         return new Promise((resolve) => setTimeout(resolve, ms));
//       }

//       await sleep(0).then(async () => {
//         console.log(
//           "owner busd bal bef deposit",
//           String(await tokenBUSD.balanceOf(owner.address))
//         );
//         console.log("default Instance", defaultInstance.address);
//         await ethers.provider.send("evm_increaseTime", [100]);
//         await ethers.provider.send("evm_mine");
//         await defaultInstance.setNFTPrice([1],[BN.from("20").mul(BN.from("10").pow("18"))]);
//         await defaultInstance
//           .connect(owner)
//           .deposit(BN.from("30").mul(BN.from("10").pow("18")), 1);
//       });

//       // await airdrops.addAirdrop()



//     });

//     it("deposit failed, if private start is not started", async () => {
//       await expect(
//         defaultInstance.deposit({ value: BN.from("10000000000000") })
//       ).to.be.revertedWith("incorrect time");
//     });

//     it("deposit revert without amount", async () => {
//       async function sleep(ms) {
//         return new Promise((resolve) => setTimeout(resolve, ms));
//       }
//       await sleep(5000).then(async () => {
//         const bal = await ethers.provider.getBalance(defaultInstance.address);
//         await expect(
//           defaultInstance.connect(owner).deposit({ value: BN.from("1125") })
//         ).to.be.revertedWith("Cannot deposit 0");
//       });
//     });
//   });

//   //   describe("CLAIM", ()=>{
//   //     it("claim success, after private end only", async ()=>{
//   //       // await ethers.provider.send("evm_increaseTime", [60]);
//   //     // await ethers.provider.send("evm_mine");
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }

//   //       await sleep(9000).then(async ()=>{
//   //         await defaultInstance.connect(owner).deposit({value: BN.from("10000000000000") })
//   //       })
//   //       await sleep(15000).then(async ()=>{
//   //         await defaultInstance.connect(owner).claim();
//   //       })
//   //     })

//   //     it("claim failed, if private end is not completed", async()=>{
//   //       await expect(defaultInstance.connect(owner).claim()).to.be.revertedWith("incorrect time");
//   //     })

//   //     it("claim failed, if amount not deposited", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }
//   //       await sleep(15000).then(async ()=>{
//   //         await expect(defaultInstance.connect(owner).claim()).to.be.revertedWith("doest have a deposit");
//   //       })
//   //     })

//   //     // it("claim failed, if already claimed", async()=>{
//   //     //   await expect().to.be.revertedWith("already claims");
//   //     // })

//   //     // it("claim failed, if nothing is available to claim", async()=>{
//   //     //   await expect().to.be.revertedWith("nothing to claim");
//   //     // })
//   //   });

//   //   describe('DESTROY', () => {
//   //     it("destroy success", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }
//   //       await sleep(9000).then(async ()=>{
//   //         await defaultInstance.connect(owner).deposit({value: BN.from("10000000000000") })
//   //       })
//   //       await sleep(15000).then(async ()=>{
//   //         await defaultInstance.connect(owner).claim();
//   //       })
//   //       await sleep(17000).then(async ()=>{
//   //         console.log("before destroying", String(await ethers.provider.getBalance(defaultInstance.address)))
//   //         const destroyed = await defaultInstance.connect(owner).destroy();
//   //         console.log("after destroying nativeCoinAmoun", String(await ethers.provider.getBalance(defaultInstance.address)));
//   //         console.log("destroyed value", String(destroyed.value));
//   //       })
//   //     })

//   //     // it("destroy failed, if other than admin is calling", async()=>{

//   //     // })
//   //   });

//   //   describe("TAKE FEE", ()=>{
//   //     it.only("take fee success", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }
//   //       await sleep(9000).then(async ()=>{
//   //         await defaultInstance.deposit({value:BN.from("10000000000000")})
//   //       })

//   //       await sleep(30000).then( async()=>{
//   //         console.log("token amount before take fee", String(await token.balanceOf(owner.address)))
//   //         console.log("value before take fee",String(await ethers.provider.getBalance(owner.address)));

//   //         await adminContract.setWallet(owner.address);
//   //         await defaultInstance.takeFee()

//   //         console.log("token amount after take fee", String(await token.balanceOf(owner.address)))
//   //         console.log("value after take fee",String(await ethers.provider.getBalance(owner.address)));
//   //         await expect(String(await token.balanceOf(owner.address))).to.be.eq("5999999999403000000000000000000000")
//   //         await expect(String(await ethers.provider.getBalance(owner.address))).to.be.eq("9979936165198404405255")
//   //       })
//   //     })

//   //     it("take fee failed, if time is not correct", async()=>{
//   //       await expect(defaultInstance.takeFee()).to.be.revertedWith("It is not time yet");
//   //     })

//   //     it("take fee failed, if Already paid", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }

//   //       await sleep(30000).then(async ()=>{
//   //         await defaultInstance.takeFee();
//   //         await expect(defaultInstance.takeFee()).to.be.revertedWith("Already paid");
//   //       })
//   //     })
//   //   });

//   //   describe("TAKE lOCKED", async()=>{
//   //     it("takeLocked success", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }
//   //       await sleep(9000).then(async ()=>{
//   //         await defaultInstance.deposit({value:BN.from("10000000000000")})
//   //       })
//   //       await sleep(2592020).then( async ()=>{
//   //         // console.log("take locked token BEFORE",await token.balanceOf(owner.address));
//   //         // console.log("take locked value BEFORE",await ethers.provider.getBalance(owner.address));
//   //         await defaultInstance.takeLocked();
//   //         // console.log("take locked token AFTER",await token.balanceOf(owner.address));
//   //         // console.log("take locked value AFTER",await ethers.provider.getBalance(owner.address));
//   //         // await expect(String(await token.balanceOf(owner.address))).to.be.eq("5999999999403000000000000000000000")
//   //         // await expect(String(await ethers.provider.getBalance(owner.address))).to.be.eq("")
//   //       })
//   //     })

//   //     it("takeLocked failed, if other than admin is calling", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }

//   //       await sleep(2592030).then(async ()=>{
//   //         await expect(defaultInstance.connect(accounts[2]).takeFee()).to.be.revertedWith("Sender is not an admin");
//   //       })
//   //     })

//   //     it("takeLocked failed, if time is not correct", async ()=>{
//   //       await expect(defaultInstance.takeLocked()).to.be.revertedWith("It is not time yet");
//   //     })
//   //   });

//   //   describe("TAKE LEFT OVERS", ()=>{
//   //     it("take left overs success", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }
//   //       await sleep(9000).then(async ()=>{
//   //         await defaultInstance.deposit({value:BN.from("10000000000000")})
//   //       })
//   //       await sleep(40000).then( async()=>{
//   //         console.log("token amount before take Left overs", String(await token.balanceOf(owner.address)))
//   //         console.log("value before take Left overs",String(await ethers.provider.getBalance(owner.address)));

//   //         await defaultInstance.takeLeftovers()

//   //         console.log("token amount after take Left overs", String(await token.balanceOf(owner.address)))
//   //         console.log("value after take Left overs",String(await ethers.provider.getBalance(owner.address)));

//   //         await expect(String(await token.balanceOf(owner.address))).to.be.eq("5999999999697000000000000000000000");
//   //         await expect(String(await ethers.provider.getBalance(owner.address))).to.be.eq(9979936516961816310122);
//   //       });
//   //     })

//   //     it("take left overs failed, if public & private sale is not completed", async()=>{
//   //       await expect(defaultInstance.takeLeftovers()).to.be.revertedWith("It is not time yet");
//   //     })

//   //     it("take left overs failed, if Already paid", async()=>{
//   //       async function sleep(ms) {
//   //         return new Promise(resolve => setTimeout(resolve, ms));
//   //       }

//   //       await sleep(30000).then(async ()=>{
//   //         await defaultInstance.takeLeftovers();
//   //         await expect(defaultInstance.takeLeftovers()).to.be.revertedWith("Already paid");
//   //       })
//   //     })

//   //   });
// });
