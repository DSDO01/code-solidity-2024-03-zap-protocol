// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;
// const {
//   time, // time
//   constants,
// } = require("@openzeppelin/test-helpers");

// function sleep(time) {
//   return new Promise((resolve) => setTimeout(resolve, time));
// }
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
// describe("ION Token Testing", async () => {
//   beforeEach(async () => {
//     [owner] = await ethers.getSigners();
//     accounts = await ethers.getSigners();
//     provider = await ethers.provider;

//     Admin = await ethers.getContractFactory("Admin");
//     Weth9 = await ethers.getContractFactory("WETH9");
//     Pair = await ethers.getContractFactory("UniswapV2Pair");
//     Factory = await ethers.getContractFactory("UniswapV2Factory");
//     Router = await ethers.getContractFactory("UniswapV2Router02");
//     ion = await ethers.getContractFactory("ION");
//     getinit = await ethers.getContractFactory("CallHash");
//     Usdc = await ethers.getContractFactory("USDCWithSixDecimal");
//     SuperCharge = await ethers.getContractFactory("SuperCharge");
//     Staking = await ethers.getContractFactory("Staking");
//     Rewards = await ethers.getContractFactory("Rewards");
//     TokenSale = await ethers.getContractFactory("TokenSale");

//     Getinit = await getinit.deploy();
//     await Getinit.deployed();
//     console.log("init hash", await Getinit.getInitHash());

//     usdc = await Usdc.deploy("USDC", "TestUSDC");
//     tokenSaleContract = await TokenSale.deploy();
//     console.log(tokenSaleContract.address, "TokenSale Contract");

//     factory = await Factory.deploy(owner.address);
//     await factory.deployed();



//     rewards = await Rewards.deploy();
//     await rewards.deployed();

//     adminContract = await Admin.deploy();
//     await adminContract.deployed();
//     await adminContract.initialize(owner.address);

//     // usdc = await Usdc.deploy("USDC", "USDC", BN.from("100000").mul(BN.from("10").pow("18")));

//     // pair = await Pair.deploy();
//     // await pair.deployed();

//     weth9 = await Weth9.deploy();
//     await weth9.deployed();

//     const EbscReq = [
//       [2000, 6000, 10000, 25000, 50000, 70000],
//       [2000, 6000, 10000, 25000, 50000, 70000],
//       [2000, 6000, 10000, 25000, 50000, 70000],
//       [2000, 6000, 10000, 25000, 50000, 70000, 300000],
//     ];
//     stakingContract = await Staking.deploy();
//     await stakingContract.deployed();

//     router = await Router.deploy(factory.address, weth9.address);
//     await router.deployed();

//     ionToken = await ion.deploy(
//       "TestION",
//       "TION",
//       BN.from("50000000").mul(BN.from("10").pow("18")),
//       accounts[14].address,
//       router.address,
//       owner.address,
//       adminContract.address,
//       owner.address,
//       usdc.address
//     );
//     // await ionToken.deployed();
//     console.log("ion done");
//     superCharge = await SuperCharge.deploy();
//     await superCharge.initialize(adminContract.address, ionToken.address);
//     await rewards.initialize(
//       adminContract.address,
//       ionToken.address,
//       router.address
//     );
//     console.log("Initialized rewards and supercharge");

//     await ionToken.setRewards([3000, 1500, 1500, 3000, 1000]);
//     await ionToken
//       .connect(owner)
//       .approve(
//         router.address,
//         BN.from("5000000000000000000000000").mul(BN.from("10").pow("18"))
//       );
//     console.log(
//       "owner balance",
//       String(await ionToken.balanceOf(owner.address))
//     );

//     await adminContract.addOperator(owner.address);

//     await stakingContract.initialize(
//       ionToken.address,
//       adminContract.address,
//       router.address,
//       weth9.address,
//       EbscReq
//     );
//     // const now = (await time.latest()).toNumber();
//     // const newNow = BN.from(now).add(duration.minutes(5));
//     // const end = BN.from(newNow).add(duration.minutes(15));

//     // defaultParams = {
//     //   totalSupply: BN.from("10000").mul(BN.from("10").pow("18")),
//     //   privateStart: (newNow),
//     //   privateTokenPrice:BN.from("1").mul(BN.from("10").pow("18")),
//     //   privateEnd: (end),
//     // };
//     // await tokenSaleContract.initialize(defaultParams,stakingContract,adminContract);

//     await ionToken.setRewardsContract(rewards.address);
//     await ionToken.setDevWallet(accounts[12].address);
//     await ionToken.excludeFromFee(superCharge.address);
//     await ionToken.excludeFromFee(stakingContract.address);
//     await ionToken.excludeFromFee(rewards.address);
//     await ionToken.setEnableSwapAndLiquify(true);

//     console.log("done");
//     const allocation = [
//       [15, 75, 150, 350, 750, 1125],
//       [30, 115, 225, 550, 1125, 1650],
//       [60, 225, 350, 825, 1650, 2350],
//       [200, 600, 850, 1650, 2350, 3000, 7500],
//     ];
//     await stakingContract.setAllocations(allocation);
//     await stakingContract.setMaticFeeLockLevel(1);
//     console.log("Set wallet");
    
//     await adminContract.setWallet(owner.address);
//     await adminContract.setMasterContract(tokenSaleContract.address);
//     await adminContract.setAirdrop(rewards.address);
//     await adminContract.setSuperCharge(superCharge.address);
//     await adminContract.setStakingContract(stakingContract.address);

//     console.log("setter functions ");

//     await ionToken
//       .connect(accounts[15])
//       .approve(router.address, "1000000000000000000000000000000000");

//       await ionToken.connect(accounts[14]).transfer(
//         accounts[3].address,
//         BN.from("10").mul(BN.from("10").pow("18"))
//       );

//       console.log("after transfer");


//     // await ionToken.transfer(
//     //   accounts[15].address,
//     //   BN.from("400000").mul(BN.from("10").pow("18"))
//     // );



//     // await ionToken.transfer(
//     //   accounts[5].address,
//     //   BN.from("40000").mul(BN.from("10").pow("18"))
//     // );

//     await ionToken.transfer(
//       accounts[6].address,
//       BN.from("4000").mul(BN.from("10").pow("18"))
//     );
//     // await ionToken.transfer(
//     //   accounts[7].address,
//     //   BN.from("40000").mul(BN.from("10").pow("18"))
//     // );
//     console.log("TRANSFERRRRRRRRRRRRRRR");

//     // await ionToken.transfer(
//     //   accounts[8].address,
//     //   BN.from("40000").mul(BN.from("10").pow("18"))
//     // );
//     // await factory.createPair(ionToken.address,weth9.address);

//     await router
//       .connect(owner)
//       .addLiquidityETH(
//         ionToken.address,
//         BN.from("2000000").mul(BN.from("10").pow("18")),
//         1,
//         1,
//         owner.address,
//         1659971655,
//         { value: BN.from("10").mul(BN.from("10").pow("18")) }
//       );

//       console.log("pair address", await factory.getPair(ionToken.address,weth9.address));
    

//       // console.log("pair address", pair.address);

//     await usdc
//       .connect(owner)
//       .approve(
//         router.address,
//         BN.from("5000000000000000000000000").mul(BN.from("10").pow("6"))
//       );

//     await router
//       .connect(owner)
//       .addLiquidityETH(
//         usdc.address,
//         BN.from("2000").mul(BN.from("10").pow("6")),
//         1,
//         1,
//         owner.address,
//         1659971655,
//         { value: BN.from("1").mul(BN.from("10").pow("18")) }
//       );

//     // const getAmountsOut = await router.getAmountsOut(
//     //   BN.from("500").mul(BN.from("10").pow("18")),
//     //   [ionToken.address, weth9.address]
//     // );
//     // console.log("getAmountsOut", String(getAmountsOut));

//     // const price = await ionToken.getTokenPrice();
//     // console.log("token price", String(price));
//     console.log("----------------after add liquidity-------------");
//   });

//   function sleep(ms) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   describe("SuperCharge test", async () => {
//     it.only("Multiple users", async () => {
//       //////////////////////STAKING///////////////////////

//       await ionToken.connect(accounts[14]).transfer(
//         accounts[3].address,
//         BN.from("10000").mul(BN.from("10").pow("18"))
//       );

      

//       await ionToken
//         .connect(accounts[3])
//         .approve(
//           stakingContract.address,
//           BN.from("500000000000000000000").mul(BN.from("10").pow("18"))
//           );

//           await ionToken
//           .connect(accounts[6])
//           .approve(
//             stakingContract.address,
//             BN.from("500000000000000000000").mul(BN.from("10").pow("18"))
//             );
          
//           await stakingContract
//           .connect(accounts[3])
//           .stake(2, BN.from("2000").mul(BN.from("10").pow("18")));

//           console.log("-----------Account 3 staked-----------------");



//           await ethers.provider.send("evm_increaseTime", [8000]);
//           await ethers.provider.send("evm_mine");

//           console.log("-------------EPOCH STARTS-----------------");

//           await ionToken
//           .connect(accounts[14])
//           .approve(
//             router.address,
//             BN.from("50000000000000000000000").mul(BN.from("10").pow("18"))
//           );

//           await router
//           .connect(accounts[14])
//           .swapExactTokensForETHSupportingFeeOnTransferTokens(
//             "20000000000000000000000",
//             "1",
//             [ionToken.address, weth9.address],
//             accounts[15].address,
//             1659971655
//           );



//           await stakingContract
//           .connect(accounts[6])
//           .stake(2, BN.from("2000").mul(BN.from("10").pow("18")));

//             console.log("-------------account 6 staked------------");

//           console.log("account 3 eligibility", await superCharge.isEligibleForCycle(accounts[3].address));

//           console.log("account 6 eligibility", await superCharge.isEligibleForCycle(accounts[6].address));
          










          
//           // await ethers.provider.send("evm_increaseTime", [8000]);
//           // await ethers.provider.send("evm_mine");

//           console.log("affffffff");

          

//           await router
//         .connect(accounts[14])
//         .swapExactTokensForETHSupportingFeeOnTransferTokens(
//           "20000000000000000000000",
//           "1",
//           [ionToken.address, weth9.address],
//           accounts[15].address,
//           1659971655
//         );

//         await router
//         .connect(accounts[4])
//         .swapExactETHForTokensSupportingFeeOnTransferTokens(
//           "100000000",
//           [weth9.address, ionToken.address],
//           accounts[12].address,
//           1659971655,
//           { value: BN.from("1").mul(BN.from("10").pow("18")) }
//         );

        

//         // await stakingContract
//         // .connect(accounts[6])
//         // .stake(2, BN.from("2000").mul(BN.from("10").pow("18")));


//         console.log("unstake");
//         // await stakingContract.connect(accounts[6]).unstake();

//         // console.log("eligibilty", await superCharge.isEligibleForCycle(accounts[6].address));


        
        
//         await router
//         .connect(accounts[14])
//         .swapExactTokensForETHSupportingFeeOnTransferTokens(
//           "200000000000000000000000",
//           "1",
//           [ionToken.address, weth9.address],
//           accounts[15].address,
//           1659971655
//           );
          
//           let currAmount1 = Number(await ionToken.epochCurrentAmt());
//             let endAmount1 = Number(await ionToken.epochEndAmt());
//             console.log("epoch end amount", String(await ionToken.epochEndAmt()));
//             let perc1 = (await (currAmount1 / endAmount1)) * 100;
//             console.log("epoch curr amt", currAmount1);
//             console.log("Percent1", Number(perc1));

//             // await ethers.provider.send("evm_increaseTime", [8000]);
//             // await ethers.provider.send("evm_mine");  


         

//             await router
//             .connect(accounts[14])
//             .swapExactTokensForETHSupportingFeeOnTransferTokens(
//               "20000000000000000000000",
//               "1",
//               [ionToken.address, weth9.address],
//               accounts[15].address,
//               1659971655
//             );

//             let currAmount2 = Number(await ionToken.epochCurrentAmt());
//             let endAmount2 = Number(await ionToken.epochEndAmt());
//             console.log("epoch end amount", String(await ionToken.epochEndAmt()));
//             let perc2 = (await (currAmount2 / endAmount2)) * 100;
//             console.log("epoch curr amt", currAmount2);
//             console.log("Percent2", Number(perc2));

//             // await router
//             // .connect(accounts[4])
//             // .swapExactETHForTokensSupportingFeeOnTransferTokens(
//             //   "100000000",
//             //   [weth9.address, ionToken.address],
//             //   accounts[12].address,
//             //   1659971655,
//             //   { value: BN.from("1").mul(BN.from("10").pow("18")) }
//             // );

//             console.log("balance of user 6", String(await ionToken.balanceOf(accounts[6].address)));
  
//             await stakingContract
//             .connect(accounts[6])
//             .stake(2, BN.from("2000").mul(BN.from("10").pow("18")));

//             console.log("balance of user 6 after", String(await ionToken.balanceOf(accounts[6].address)));



//           // let rewardsFive = await superCharge.userRewards(accounts[5].address, BN.from("2000").mul(BN.from("10").pow("18")));
//           // console.log("rewards of 5", String(rewardsFive[0]));

//           let rewardsSix = await superCharge.userRewards(accounts[6].address, BN.from("2000").mul(BN.from("10").pow("18")));
//           console.log("rewards of 6", String(rewardsSix[0]));

//           // console.log("rewards superCharge", String(await superCharge.superChargeRewards(1)));

//           console.log("supercharge ID", String(await superCharge.superChargeCount()));

//           console.log("ball before claim", String(await ionToken.balanceOf(accounts[6].address)));

//           // await superCharge.claimSuperCharge(accounts[6].address);

//           console.log("ball after claim", String(await ionToken.balanceOf(accounts[6].address)));


          
//           console.log("after swapppppppppppppppppppppppppppppppppppp");




//       await ionToken
//         .connect(accounts[14])
//         .approve(
//           stakingContract.address,
//           BN.from("500000000000000000000").mul(BN.from("10").pow("18"))
//         );

//       let perc = await ((ionToken.epochCurrentAmt() * 10 ** 18) /
//         (await ionToken.epochEndAmt()));

     
//       // await ionToken.connect(accounts[14]).transfer(accounts[19].address,BN.from("4400000").mul(BN.from("10").pow("18")));

//       console.log("---------------------------------------");

//       await stakingContract
//         .connect(accounts[14])
//         .stake(2, BN.from("2000").mul(BN.from("10").pow("18")), {
//           value: "9960089791076781",
//         });
//       await stakingContract
//         .connect(accounts[15])
//         .stake(3, BN.from("2000").mul(BN.from("10").pow("18")), {
//           value: "9960089791076781",
//         });


      
     

//       await router
//         .connect(accounts[14])
//         .swapExactTokensForETHSupportingFeeOnTransferTokens(
//           "200000000000000000000000",
//           "1",
//           [ionToken.address, weth9.address],
//           accounts[15].address,
//           1659971655
//         );

//       // await stakingContract.connect(accounts[15]).unstake();

//       await router
//         .connect(accounts[14])
//         .swapExactETHForTokensSupportingFeeOnTransferTokens(
//           "100000000",
//           [weth9.address, ionToken.address],
//           accounts[12].address,
//           1659971655,
//           { value: BN.from("2").mul(BN.from("10").pow("18")) }
//         );

//       // await ethers.provider.send("evm_increaseTime", [5000]);
//       // await ethers.provider.send("evm_mine");

//       await router
//         .connect(accounts[14])
//         .swapExactTokensForETHSupportingFeeOnTransferTokens(
//           "200000000000000000000000",
//           "1",
//           [ionToken.address, weth9.address],
//           accounts[15].address,
//           1659971655
//         );

//       // await router
//       // .connect(accounts[14])
//       // .swapExactETHForTokensSupportingFeeOnTransferTokens(
//       //   "100000000",
//       //   [weth9.address, ionToken.address],
//       //   accounts[12].address,
//       //   1659971655,
//       //   { value: BN.from("2").mul(BN.from("10").pow("18"))}
//       // );

//       console.log(
//         "total rewards",
//         String(await superCharge.superChargeRewards(1))
//       );

//       const balInitial15 = String(
//         await ionToken.balanceOf(accounts[15].address)
//       );
//       const balInitial14 = String(
//         await ionToken.balanceOf(accounts[14].address)
//       );

//       console.log(
//         "balance of 15 before SC claim",
//         String(await ionToken.balanceOf(accounts[15].address))
//       );
//       console.log(
//         "balance of 14 before SC claim",
//         String(await ionToken.balanceOf(accounts[14].address))
//       );

//       // await superCharge
//       // .connect(accounts[15])
//       // .claimSuperCharge(accounts[15].address);

//       // await superCharge
//       // .connect(accounts[14])
//       // .claimSuperCharge(accounts[14].address);

//       console.log(
//         "ion reward 14 ",
//         String(
//           await rewards
//             .connect(accounts[14])
//             .getIONReward(
//               accounts[14].address,
//               BN.from("2000").mul(BN.from("10").pow("18")),
//               2
//             )
//         )
//       );

//       console.log(
//         "ion reward 15 ",
//         String(
//           await rewards
//             .connect(accounts[15])
//             .getIONReward(
//               accounts[15].address,
//               BN.from("2000").mul(BN.from("10").pow("18")),
//               2
//             )
//         )
//       );

//       console.log("rewards contract ion bal ", String(await ionToken.balanceOf(rewards.address)));
//       console.log("reward contract address", rewards.address);

//       await rewards.connect(accounts[14]).claimION();
//       await rewards.connect(accounts[15]).claimION();

//       const balAfter15 = String(await ionToken.balanceOf(accounts[15].address));
//       const balAfter14 = String(await ionToken.balanceOf(accounts[14].address));

//       console.log(
//         "reward of 14 =",
//         String((balAfter14 - balInitial14) / 10 ** 18)
//       );
//       console.log(
//         "reward of 15 =",
//         String((balAfter15 - balInitial15) / 10 ** 18)
//       );

//       console.log(
//         "balance of 15 after SC claim",
//         String(await ionToken.balanceOf(accounts[15].address))
//       );
//       console.log(
//         "balance of 14 after SC claim",
//         String(await ionToken.balanceOf(accounts[14].address))
//       );

//       console.log("epoch count ", String(await superCharge.superChargeCount()));

//       console.log(
//         "epoch current amount after",
//         String(await ionToken.epochCurrentAmt())
//       );
//       console.log(
//         "epoch end amount after",
//         String(await ionToken.epochEndAmt())
//       );

//       // await ionToken.connect(accounts[14]).transfer(accounts[12].address, BN.from("440").mul(BN.from("10").pow("18")));

  

//       await ionToken
//         .connect(accounts[15])
//         .approve(
//           stakingContract.address,
//           BN.from("50000000000000000").mul(BN.from("10").pow("18"))
//         );

//       // await adminContract.setStakingContract(stakingContract.address);
//       // console.log("CanClaim",await superCharge.canClaim(accounts[14].address));
//       // await stakingContract.connect(accounts[15]).stake(1, BN.from("20000").mul(BN.from("10").pow("18")));
//       // await stakingContract.connect(accounts[14]).stake(1, BN.from("600000").mul(BN.from("10").pow("18"),value{BN.from("1").mul(BN.from("10").pow("18"))}));

//       const hash =
//         "0x080909c18c958ce5a2d36481697824e477319323d03154ceba3b78f28a61887b";
//       await adminContract.grantRole(hash, ionToken.address);

//       console.log(await adminContract.hasRole(hash, ionToken.address));
//       console.log(
//         "USER STATE",
//         String(await stakingContract.getUserState(accounts[15].address))
//       );

//       console.log(
//         "bal of 15 before unstake",
//         String(await ionToken.balanceOf(accounts[15].address))
//       );

//       // await stakingContract.connect(accounts[15]).unstake();

//       // let currAmount1 = Number(await ionToken.epochCurrentAmt());
//       // let endAmount1 = Number(await ionToken.epochEndAmt());
//       // console.log("epoch end amount", String(await ionToken.epochEndAmt()));
//       // let perc1 = (await (currAmount1 / endAmount1)) * 100;
//       // console.log("Percent1", Number(perc1));

//       console.log(
//         "bal of supercharge",
//         String(await ionToken.balanceOf(superCharge.address))
//       );

//       console.log(
//         "bal of account 14",
//         String(await ionToken.balanceOf(accounts[14].address))
//       );

//       console.log(
//         "bal of account 15",
//         String(await ionToken.balanceOf(accounts[15].address))
//       );

//       await superCharge
//         .connect(accounts[14])
//         .claimSuperCharge(accounts[14].address);

//       console.log(
//         "bal of supercharge",
//         String(await ionToken.balanceOf(superCharge.address))
//       );

//       console.log(
//         "bal of account 14",
//         String(await ionToken.balanceOf(accounts[14].address))
//       );

//       console.log(
//         "bal of account 15",
//         String(await ionToken.balanceOf(accounts[15].address))
//       );

//       // let currAmount2 = Number(await ionToken.epochCurrentAmt());
//       // let endAmount2 = Number(await ionToken.epochEndAmt());
//       // let perc2 = (await (currAmount2 / endAmount2)) * 100;
//       // console.log("Percent2", Number(perc2));
//     });
//     it("Swap&Liquify", async () => {


//       console.log(
//         "before swap eth",
//         String(await ethers.provider.getBalance(accounts[14].address))
//       );
//       console.log(
//         "ION TOKEN BEFORE",
//         String(await ionToken.balanceOf(ionToken.address))
//       );
//       await ionToken
//         .connect(accounts[14])
//         .approve(
//           router.address,
//           BN.from("50000000000000000000000").mul(BN.from("10").pow("18"))
//         );
//       await ethers.provider.send("evm_increaseTime", [5000]);
//       await ethers.provider.send("evm_mine");

//       const account2BalAfterTransfer = await ionToken.balanceOf(
//         accounts[2].address
//       );
//       console.log(
//         "account 2 balance before transfer :",
//         String(account2BalAfterTransfer)
//       );
      
//       await router
//       .connect(accounts[14])
//       .swapExactETHForTokensSupportingFeeOnTransferTokens(
//         "100000000",
//         [weth9.address, ionToken.address],
//         accounts[14].address,
//         1659971655,
//         { value: BN.from("2").mul(BN.from("10").pow("18")) }
//       );
//       console.log("account 14 balance ----", String(await ionToken.balanceOf(accounts[14].address)));
      
//       console.log("owner bal", String(await ionToken.balanceOf(owner.address)));
//       // await ionToken.transfer(
//       //   accounts[2].address,
//       //   BN.from("50").mul(BN.from("10").pow("18"))
//       // );

//       await ionToken.connect(accounts[14]).transfer(
//         accounts[3].address,
//         BN.from("10").mul(BN.from("10").pow("18"))
//       );
//         console.log("TRANSFER DONE");
//       let pairAddress = await factory.getPair(ionToken.address,weth9.address);
        
//       pair = await Pair.attach(pairAddress);
//       await pair.deployed();

//    console.log("lp token bal", String(await pair.balanceOf(ionToken.address)));

//       // await router
//       //   .connect(accounts[14])
//       //   .swapExactTokensForETHSupportingFeeOnTransferTokens(
//       //     "40000000000000000000000",
//       //     "1",
//       //     [ionToken.address, weth9.address],
//       //     accounts[14].address,
//       //     1659971655
//       //   );


//     })
//   });
// });
