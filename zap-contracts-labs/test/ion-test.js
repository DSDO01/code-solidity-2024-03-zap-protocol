// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;

// function sleep(time) {
//     return new Promise((resolve) => setTimeout(resolve, time));
// }
// describe("ION Token Testing", async () => {
//     beforeEach(async () => {
//         [owner] = await ethers.getSigners();
//         accounts = await ethers.getSigners();
//         provider = await ethers.provider;

//         Weth9 = await ethers.getContractFactory("WETH9");
//         Pair = await ethers.getContractFactory("UniswapV2Pair");
//         Factory = await ethers.getContractFactory("UniswapV2Factory");
//         Router = await ethers.getContractFactory("UniswapV2Router02");
//         ion = await ethers.getContractFactory("ION");
//         getinit = await ethers.getContractFactory("CallHash");
//         Usdc = await ethers.getContractFactory("USDC");
//         Admin = await ethers.getContractFactory("Admin");
//         Staking = await ethers.getContractFactory("Staking");
//         TokenSaleContract = await ethers.getContractFactory("TokenSale");
//         SuperCharge = await ethers.getContractFactory("SuperCharge");
//         Getinit = await getinit.deploy();
//         await Getinit.deployed();
//         console.log("init hash", await Getinit.getInitHash());

//         factory = await Factory.deploy(owner.address);
//         await factory.deployed();

//         admin = await Admin.deploy();
//         await admin.deployed();
//         admin.initialize(owner.address);

//         usdc = await Usdc.deploy("USDC", "USDC", BN.from("100000").mul(BN.from("10").pow("18")));
//         console.log("usdc address", usdc.address)
//         pair = await Pair.deploy();
//         await pair.deployed();

//         // tokenSaleContract = await TokenSaleContract.deploy();
//         weth9 = await Weth9.deploy();
//         await weth9.deployed();

//         router = await Router.deploy(factory.address, weth9.address);
//         await router.deployed();

//         ionToken = await ion.deploy(
//             "Lithium",
//             "ION",
//             BN.from("50000000").mul(BN.from("10").pow("18")),
//             accounts[14].address,
//             router.address,
//             owner.address,
//             admin.address,
//             owner.address
//         );
//         await ionToken.deployed();

//         stakingContract = await Staking.deploy();
//         stakingContract.deployed();

//         superCharge = await SuperCharge.deploy();
//         await superCharge.initialize(admin.address, ionToken.address)

//         await ionToken
//             .connect(owner)
//             .approve(router.address, BN.from("5000000").mul(BN.from("10").pow("18")));
//         console.log(
//             "owner balance",
//             String(await ionToken.balanceOf(owner.address))
//         );

//         await ionToken.setRewardsContract(accounts[11].address);
//         await ionToken.setDevWallet(accounts[12].address);

//         // const stakingAddress = await ionToken.stakingAddress();
//         // const airdropAddress = await ionToken.airdropAddress();
//         // const devAddress = await ionToken.devWallet();

//         await ionToken.setRewards([3000,1500,1500,3000,1000]);
//         await admin.setSuperCharge(superCharge.address);
//         await admin.setStakingContract(stakingContract.address);
//         // await admin.setMasterContract(tokenSaleContract.address);
//         // await ionToken.setBuyTax(8);
//         // await ionToken.setSellTax(12, 8);
//         // await ionToken.setTxTax(3);

//         console.log("setter functions ");

//         await router
//             .connect(owner)
//             .addLiquidityETH(
//                 ionToken.address,
//                 BN.from("500").mul(BN.from("10").pow("18")),
//                 1,
//                 1,
//                 owner.address,
//                 1659971655,
//                 { value: BN.from("5").mul(BN.from("10").pow("17")) }
//             );

//         // const getAmountsOut = await router.getAmountsOut(
//         //     BN.from("1").mul(BN.from("10").pow("18")),
//         //     [ionToken.address, weth9.address]
//         // );
//         // console.log("amounts out", String(getAmountsOut));


//     });

//     function sleep(ms) {
//         return new Promise((resolve) => setTimeout(resolve, ms));
//     }

//     describe("ion test", async () => {

//         it("Selling ION", async () => {
//             console.log("------------------------------------------------------------------");
//             console.log(
//                 "before transfer ,account 14",
//                 String(await ionToken.balanceOf(accounts[14].address))
//             );

//             await ionToken
//                 .connect(accounts[14])
//                 .approve(
//                     router.address,
//                     BN.from("5000000000").mul(BN.from("10").pow("18"))
//                 );

//             console.log(
//                 "before swap eth",
//                 String(await ethers.provider.getBalance(accounts[14].address))
//             );
//             console.log(
//                 "ION TOKEN BEFORE",
//                 String(await ionToken.balanceOf(ionToken.address))
//             );

//             await router
//                 .connect(accounts[14])
//                 .swapExactTokensForETHSupportingFeeOnTransferTokens(
//                     "50000000000000000000",
//                     "1",
//                     [ionToken.address, weth9.address],
//                     accounts[14].address,
//                     1659971655
//                 );
//             console.log(
//                 "after swap eth",
//                 String(await ethers.provider.getBalance(accounts[14].address))
//             );

//             console.log(
//                 "before transfer ,account 15",
//                 String(await ionToken.balanceOf(accounts[15].address))
//             );
//             console.log(
//                 "ION TOKEN",
//                 String(await ionToken.balanceOf(ionToken.address))
//             );

//             console.log(
//                 "after transfer ,account 14",
//                 String(await ionToken.balanceOf(accounts[14].address))
//             );

//             console.log("epoch bool", await ionToken.checkEpoch());
//         });

//         it("Buying ION", async () => {
//             // console.log(
//             //     "ION TOKEN BALANCE",
//             //     String(await ionToken.balanceOf(ionToken.address))
//             // );
//             // console.log(
//             //     "Account 14",
//             //     String(await ionToken.balanceOf(accounts[14].address))
//             // );
//             // await ethers.provider.send("evm_increaseTime", [8000]);
//             // await ethers.provider.send("evm_mine");
//             console.log(
//                 "ION TOKEN BALANCE",
//                 String(await ionToken.balanceOf(ionToken.address))
//             );

//             console.log(
//                 "epoch current amount before",
//                 String(await ionToken.epochCurrentAmt())
//             );
//             console.log(
//                 "epoch end amount before",
//                 String(await ionToken.epochEndAmt())
//             );

//             console.log(
//                 "ACCOUNT 19 BALANCE BEFORE SWAP ",
//                 String(await ionToken.balanceOf(accounts[19].address))
//             );

//             console.log(
//                 "ACCOUNT ion contract BALANCE BEFORE SWAP ",
//                 String(await ionToken.balanceOf(ionToken.address))
//             );

//             await router
//                 .connect(accounts[19])
//                 .swapExactETHForTokensSupportingFeeOnTransferTokens(
//                     "1000",
//                     [weth9.address, ionToken.address],
//                     accounts[19].address,
//                     1659971655,
//                     { value: BN.from("1").mul(BN.from("10").pow("18"))}
//                 );

//                 console.log(
//                     "ACCOUNT ion contract BALANCE after SWAP ",
//                     String(await ionToken.balanceOf(ionToken.address))
//                 );

//             console.log(
//                 "ACCOUNT 19 BALANCE AFTER SWAP",
//                 String(await ionToken.balanceOf(accounts[19].address))
//             );
//             console.log(
//                 "ION TOKEN BALANCE after swap",
//                 String(await ionToken.balanceOf(ionToken.address))
//             );
//             // await router
//             // .connect(accounts[14])
//             // .swapExactETHForTokensSupportingFeeOnTransferTokens(
//             //   "1000",
//             //   [weth9.address, ionToken.address],
//             //   accounts[14].address,
//             //   1659971655,
//             //   { value: BN.from("1").mul(BN.from("10").pow("10"))}
//             // );


//             console.log(
//                 "epoch current amount",
//                 String(await ionToken.epochCurrentAmt())
//             );
//             console.log("epoch end amount", String(await ionToken.epochEndAmt()));

           
//             // await router.connect(accounts[15]).swapExactETHForTokensSupportingFeeOnTransferTokens("100", [weth9.address, ionToken.address], accounts[14].address, 1659971655, { value: BN.from("1").mul(BN.from("10").pow("18")) });
//             // console.log("ION TOKEN BALANCE", String(await ionToken.balanceOf(ionToken.address)));
//         });

//         it("Owner bal, total supply", async () => {
//             const ownerBal = await ionToken.balanceOf(owner.address);
//             console.log("ownerBal", String(ownerBal)); // should have some bal

//             console.log("total supply ===", String(await ionToken.totalSupply()));
//             await ethers.provider.send("evm_increaseTime", [600]);
//             await ethers.provider.send("evm_mine");
//             await ionToken.mint(owner.address, 100);
//             console.log("total supply after", String(await ionToken.totalSupply()));
//             // const updatedOwnerBal = await ionToken.balanceOf(owner.address);
//             // console.log("updatedOwnerBal", String(updatedOwnerBal));

//             // const otheraccBal = await ionToken.balanceOf(accounts[2].address);
//             // console.log("otheraccBal", String(otheraccBal)); // should be 0
//         });

//         it("add liquidity", async () => {
//             // await factory.createPair(ionToken.address,weth9.address);
//             // 1matic //1000 token
//             await router
//                 .connect(owner)
//                 .addLiquidityETH(
//                     ionToken.address,
//                     BN.from("5000000").mul(BN.from("10").pow("18")),
//                     10,
//                     1,
//                     owner.address,
//                     1659971655,
//                     { value: "10" }
//                 );
//             console.log("Liquidity added successfully ");

//             // console.log("pairAddress", pairAddress);

//             const getAmountsOut = await router.getAmountsOut(
//                 BN.from("500").mul(BN.from("10").pow("18")),
//                 [ionToken.address, weth9.address]
//             );
//             // console.log("getAmountsOut", String(getAmountsOut));

//             const price = await ionToken.getTokenPrice();
//             console.log("token price", String(price));

//             const marketCap = await ionToken.marketCap();
//             console.log("market cap", String(marketCap));
//             console.log("total", String(await ionToken.totalSupply()));
//         });


//         it("setting & getting rewards ", async () => {
//             await ionToken.setRewards([300, 150, 150, 400, 0]);

//             console.log(
//                 "array",
//                 String(await ionToken.rewardsAmt(0)),
//                 String(await ionToken.rewardsAmt(1)),
//                 String(await ionToken.rewardsAmt(2)),
//                 String(await ionToken.rewardsAmt(3)),
//                 String(await ionToken.rewardsAmt(4))
//             );
//         });

//         it("set buy tax", async () => {
//             await ionToken.setBuyTax(8);
//             console.log("buy tax ", String(await ionToken.buyTax()));
//         });

//         it("set sell tax", async () => {
//             await ionToken.setSellTax(12, 8);
//             const sellMaxTax = await ionToken.sellMaxTax();
//             const sellMintax = await ionToken.sellMinTax();
//             console.log("sell tax ", String(sellMaxTax), String(sellMintax));
//         });

//         it("set tx tax", async () => {
//             await ionToken.setTxTax(3);
//             const txTax = await ionToken.txTax();
//             console.log("tx tax", String(txTax));
//         });

//         it("Transfer to non excluded users ", async () => {
//             await ionToken.transfer(
//                 accounts[2].address,
//                 BN.from("50").mul(BN.from("10").pow("18"))
//             );
//             const account3BalBeforeTransfer = await ionToken.balanceOf(
//                 accounts[3].address
//             );
//             console.log(
//                 "account 3 balance before transfer :",
//                 String(account3BalBeforeTransfer)
//             );

//             await ionToken
//                 .connect(accounts[2])
//                 .transfer(
//                     accounts[3].address,
//                     BN.from("10").mul(BN.from("10").pow("18"))
//                 );

//             const account3BalAfterTransfer = await ionToken.balanceOf(
//                 accounts[3].address
//             );
//             console.log(
//                 "account 3 balance after transfer :",
//                 String(account3BalAfterTransfer)
//             );

//             const generatedTax = await ionToken.balanceOf(ionToken.address);
//             console.log("generated tax", String(generatedTax));
//         });

//         it("Transfer from owner to another user", async () => {
//             console.log(
//                 "owner balance",
//                 String(await ionToken.balanceOf(owner.address))
//             );
//             console.log(
//                 "before transfer ,account 3",
//                 String(await ionToken.balanceOf(accounts[3].address))
//             );
//             await ionToken.transfer(
//                 accounts[3].address,
//                 BN.from("10").mul(BN.from("10").pow("18"))
//             );

//             console.log(
//                 "after transfer ,account 3",
//                 String(await ionToken.balanceOf(accounts[3].address))
//             );
//             console.log(
//                 "Reflection generated",
//                 String(await ionToken.balanceOf(ionToken.address))
//             );
//         });

//         // it("percent increase every time", async () => {
//         //   await ionToken.linearPercentIncrease(10);
//         //   const increasedPercent = await ionToken.increasePercent();
//         //   console.log("increasedPercent", String(increasedPercent));
//         // });

//         // it("Selling ION", async () => {
//         //   console.log("Accounts 2 before balance", String(await ionToken.balanceOf(accounts[2].address)));

//         //   const getAmountsOut = await router.getAmountsOut(
//         //     BN.from("500").mul(BN.from("10").pow("18")),
//         //     [ionToken.address, weth9.address]
//         //   );
//         //   console.log("getAmountsOut", String(getAmountsOut));

//         //   // await ionToken.transfer(accounts[2].address, BN.from("50").mul(BN.from("10").pow("18")))
//         //   console.log("Sell tax before swap", String(await ionToken.balanceOf(owner.address)));
//         //   console.log("Accounts 2 balance", String(await ethers.provider.getBalance(accounts[3].address)));
//         //   await router.swapExactTokensForETH("1000000000000000000000", "1", [ionToken.address, weth9.address], accounts[3].address, 1659971655);
//         //   console.log("after swap", String(await ethers.provider.getBalance(accounts[3].address)));

//         // });




//         it("Epoch", async () => {
//             const marketCap = await ionToken.marketCap();
//             console.log("market cap", String(marketCap));
//             console.log("total", String(await ionToken.totalSupply()));
//             await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
//                 "100000000000000000",
//                 [weth9.address, ionToken.address],
//                 accounts[3].address,
//                 1659971655,
//                 { value: BN.from("1").mul(BN.from("10").pow("16")) }
//             );
//             await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
//                 "149100000000000000000",
//                 "1",
//                 [ionToken.address, weth9.address],
//                 accounts[3].address,
//                 1659971655
//             );
//             console.log("total", String(await ionToken.totalSupply()));
//             console.log("market cap", String(marketCap));
//         });


//         // it("excluded from fee", async () => {
//         //   console.log("await ionToken._isExcludedFromFee(owner.address)",
//         //     await ionToken._isExcludedFromFee(accounts[10]))
//         // })
//     });

//     it("addToBlacklist", async () => {
//         // await ionToken.addToBlacklist(accounts[14].address);
//         console.log("account 14", accounts[14].address);

//         await ethers.provider.send("evm_increaseTime", [800]);
//         await ethers.provider.send("evm_mine");
//         console.log("ION TOKEN BALANCE", String(await ionToken.balanceOf(ionToken.address)));

//         console.log("ACCOUNT 14 BALANCE BEFORE SWAP ", String(await ionToken.balanceOf(accounts[14].address)));

//         await router
//             .connect(accounts[14])
//             .swapExactETHForTokensSupportingFeeOnTransferTokens(
//                 "0",
//                 [weth9.address, ionToken.address],
//                 accounts[14].address,
//                 1659971655,
//                 { value: BN.from("1").mul(BN.from("10").pow("15")) }
//             );

//         console.log("ACCOUNT 14 BALANCE AFTER SWAP", String(await ionToken.balanceOf(accounts[14].address)));
//         console.log("ION TOKEN BALANCE", String(await ionToken.balanceOf(ionToken.address)));

//     });
// });
