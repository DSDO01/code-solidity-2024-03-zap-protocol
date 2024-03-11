const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time,constants } = require("@openzeppelin/test-helpers");

const { BigNumber } = ethers;

// const duration = {
//     seconds(val) {
//         return BigNumber.from(val);
//     },
//     minutes(val) {
//         return BigNumber.from(val).mul(this.seconds("60"));
//     },
//     hours(val) {
//         return BigNumber.from(val).mul(this.minutes("60"));
//     },
//     days(val) {
//         return BigNumber.from(val).mul(this.hours("24"));
//     },
//     weeks(val) {
//         return BigNumber.from(val).mul(this.days("7"));
//     },
//     years(val) {
//         return BigNumber.from(val).mul(this.days("365"));
//     },
// };


describe("Admin contract testing", function () {
    const hour = 3600;
    const day = hour * 24;
    const week = day * 7;

    let owner;
    let accounts;
    let user1;
    let user2;
    let user3;

    let TokenA;
    let tokenA;
    let TokenB;
    let tokenB;

    let OwnedUpgradeabilityProxy;
    let proxy;
    let ProxyAddress;

    let Admin;
    let admin;
    let TokenSaleETH;
    let masterAdmin;

    let WETH9;
    let wETH;
    let UniswapV2Factory;
    let factory;
    let UniswapV2Router02;
    let router;


    beforeEach(async function () {
        [owner, accounts, user1, user2, user3] = await ethers.getSigners();
        
        // Deploy Token contract
        TokenA = await ethers.getContractFactory("TokenA");
        tokenA = await TokenA.deploy();

        // TokenB = await ethers.getContractFactory("TokenB");
        // tokenB = await TokenA.deploy();

        // proxy contract deploy
        OwnedUpgradeabilityProxy = await ethers.getContractFactory("OwnedUpgradeabilityProxy");
        proxy = await OwnedUpgradeabilityProxy.deploy();

        // Deploy the TokenSaleETH contract
        TokenSaleETH = await ethers.getContractFactory("TokenSaleETH");
        masterAdmin = await TokenSaleETH.deploy();

        
        // Deploy the Admin contract
        Admin = await ethers.getContractFactory("Admin");
        admin = await Admin.connect(accounts).deploy()

        await admin.connect(accounts).initialize(owner.address);
        await admin.connect(owner).setMasterContractETH(masterAdmin.address);


        WETH9 = await ethers.getContractFactory("WETH9");
        wETH = await WETH9.connect(owner).deploy();

        UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await UniswapV2Factory.connect(owner).deploy(owner.address);

        UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
        router = await UniswapV2Router02.connect(owner).deploy(factory.address, wETH.address);

        await proxy.upgradeTo(admin.address);
        ProxyAddress = await admin.attach(proxy.address);
        await ProxyAddress.initialize(admin.address);


    });

    it.only("testing for createPoolNew in admin contract", async function () {

        const _config = {
            LPLockin: 0,
            vestingPeriod: 0,
            vestingDistribution: 300,
            NoOfVestingIntervals: 3,
            FirstVestPercentage:5000,
            LiqGenerationTime: 0
        }

        const _params = {
            tokenAddress: tokenA.address,
            routerAddress: router.address,
            totalSupply: ethers.utils.parseEther("10000"),
            saleStart: Math.floor(Date.now() / 1000) + 7200,
            saleEnd: Math.floor(Date.now() / 1000) + 8200,
            liqudityPercentage: 5000,
            tokenLiquidity: ethers.utils.parseEther("100"),
            baseLine: ethers.utils.parseEther("5"),
            burnUnsold: true
        };
        

        // console.log("params",_params);

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 10,
                Math.floor(Date.now() / 1000) + 20,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("3"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );
        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10100"));
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )
        
        await masterAdmin.connect(owner).deposit({value: ethers.utils.parseEther("3")});
        // await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        
        await ethers.provider.send("evm_increaseTime", [20]);

        state = await masterAdmin.connect(owner).state();
        console.log("states", String(state[0], String(state[1])));
        console.log("tokenBalance",String(await tokenA.connect(owner).balanceOf(masterAdmin.address)));

        await masterAdmin.connect(owner).takeUSDBRaised();
        
        await masterAdmin.connect(owner).addLiq();
        console.log("tokenBalance", String(await tokenA.connect(owner).balanceOf(masterAdmin.address)));

        await ethers.provider.send("evm_increaseTime", [10]);

        // await masterAdmin.connect(owner).claim();
        stake = await masterAdmin.connect(owner).stakes(owner.address)
        console.log("stake",String(stake[0]), String(stake[1]));

        await masterAdmin.connect(owner).vesting();

        stake = await masterAdmin.connect(owner).stakes(owner.address)
        console.log("stake",String(stake[0]), String(stake[1]), String(stake[2]));

        await ethers.provider.send("evm_increaseTime", [90]);
        await masterAdmin.connect(owner).vesting();

        console.log("tokenBalance", String(await tokenA.connect(owner).balanceOf(masterAdmin.address)));


    });

    it("testing for createPoolNew in admin contract", async function () {
        
        await masterAdmin.connect(owner).initialize(
            [
                "0xf3df9a40f6066f920CecE82852D50fc39003E81B",
                "0xc47d832aC7486E05E1Fdf8945009F12ab0654Eb7",
                ethers.utils.parseEther("10000"),
                1709801848,
                1709802028,
                2000,
                ethers.utils.parseEther("10000"),
                ethers.utils.parseEther("200000"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("200000"),
            2000,
            false
            );
        // await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10100"));
        // await masterAdmin.connect(owner).setConfig(
        //     [60, 300, 300, 4, 5000, 60], owner.address
        // )
        
        // await masterAdmin.connect(owner).deposit({value: ethers.utils.parseEther("3")});
        // await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        
        // await ethers.provider.send("evm_increaseTime", [20]);

        // state = await masterAdmin.connect(owner).state();
        // console.log("states", String(state[0], String(state[1])));
        // console.log("tokenBalance",String(await tokenA.connect(owner).balanceOf(masterAdmin.address)));

        // await masterAdmin.connect(owner).takeUSDBRaised();
        
        // await masterAdmin.connect(owner).addLiq();
        // console.log("tokenBalance", String(await tokenA.connect(owner).balanceOf(masterAdmin.address)));

        
    });
});