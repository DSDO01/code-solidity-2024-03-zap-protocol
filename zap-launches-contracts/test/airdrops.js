// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;


// beforeEach(async () => {

//     [owner, user1, user2, user3] = await ethers.getSigners();
//     provider = ethers.provider;

//     Admin = await ethers.getContractFactory("Admin");
//     TokenSale = await ethers.getContractFactory("TokenSale");
//     Token = await ethers.getContractFactory("Token");
//     LpToken = await ethers.getContractFactory("Token");
//     Staking = await ethers.getContractFactory("Staking");
//     Oracle = await ethers.getContractFactory("ChainLink");
//     Airdrops = await ethers.getContractFactory("Airdrops");
//     Weth = await ethers.getContractFactory("WETH");
//     Factory = await ethers.getContractFactory("UniswapV2Factory");
//     Router = await ethers.getContractFactory("UniswapV2Router01");
//     EBSC = await ethers.getContractFactory("EBSC");
//     getinit = await ethers.getContractFactory("CalHash");
//     Getinit = await getinit.deploy();

//     await Getinit.deployed();
//     // console.log("init", await Getinit.getInitHash());

//     token = await Token.deploy("Token", "tkn");
//     await token.deployed();


//     lpToken = await Token.deploy("LPToken", "lptkn");
//     await lpToken.deployed();
    

//     factory = await Factory.deploy(owner.address);
//     await factory.deployed();

//     weth = await Weth.deploy();
//     await weth.deployed();
//     // console.log("Weth address: ", weth.address);

//     router = await Router.deploy(factory.address, weth.address);
//     await router.deployed();

//     eb = await EBSC.deploy(router.address)
//     await eb.deployed();


//     adminContract = await Admin.deploy();
//     await adminContract.deployed();

//     tokenSaleContract = await TokenSale.deploy();
//     await tokenSaleContract.deployed();

//     oracle = await Oracle.deploy();
//     await oracle.deployed();


//     stakingContract = await Staking.deploy();
//     await stakingContract.deployed();

//     airdrops = await Airdrops.deploy(stakingContract.address, adminContract.address, eb.address);
//     await airdrops.deployed();

//     console.log("Deployment done");


// })

// describe("EBSC Testing", async() =>{


// it.only("Initialize", async () => {

//     await adminContract.addOperator(owner.address);
//     await adminContract.setMasterContract(tokenSaleContract.address);
//     await adminContract.setOracleContract(oracle.address);
//     await adminContract.setStakingContract(stakingContract.address);
//     await adminContract.setAirdrop(airdrops.address);

//     const allocationsArray = [[100, 250, 500, 1250], [125, 325, 625, 1750, 222, 565], [150, 400, 750, 2000], [200, 500, 1000, 2500, 3500]];
//     const EbscReq = [[200000, 600000, 1000000, 2500000, 5000000, 7000000],
//     [200000, 600000, 1000000, 2500000, 5000000, 7000000],
//     [200000, 600000, 1000000, 2500000, 5000000, 7000000],
//     [200000, 600000, 1000000, 2500000, 5000000, 7000000, 30000000]];

//     await stakingContract.connect(owner).initialize(eb.address, adminContract.address, router.address, weth.address, EbscReq);
    
//     console.log("Token.balance", String(await eb.balanceOf(owner.address)));
    
//     await eb.connect(owner).approve(stakingContract.address, BN.from("300000").mul(BN.from("10").pow("18")));
//     await eb.connect(owner).approve(router.address, BN.from("200000").mul(BN.from("10").pow("18")));

//     await router.connect(owner).addLiquidityETH(eb.address, BN.from("7").mul(BN.from("10").pow("18")), 1,
//         1, owner.address, 1671258710, { value: BN.from("10").mul(BN.from("10").pow("18")) });
        
//         //     let [,bnb] = await router. getAmountsOut(BN.from("10000").mul(BN.from("10").pow("9")),[eb.address,weth.address]);
  
//     console.log("success addLiquidity ");
//     // console.log("Before Staking ", String(await airdrops.viewBalance()));
//     // await stakingContract.stake(1, BN.from("200000").mul(BN.from("10").pow("9")), { value: BN.from("5").mul(BN.from("10").pow("18")) });
//     // console.log("After Staking",String(await airdrops.viewBalance()));
//     // console.log(String(await ethers.provider.getBalance(owner.address)));
//     // console.log("Reflection",Number(await airdrops.getReflection()));
//     // console.log(String(await airdrops.userPendingEBSC(user2.address)));
//     // console.log(String(await airdrops.distributionEBSC()));
//     });
// });

