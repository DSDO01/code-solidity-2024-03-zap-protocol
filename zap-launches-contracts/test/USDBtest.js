const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, constants } = require("@openzeppelin/test-helpers");
const { BigNumber } = ethers;

describe("TokenSaleUSDB contract testing", function () {
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
  let TokenSaleUSDB;
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

    //Deploy USDB Token
    USDB = await ethers.getContractFactory("USDB");
    usdb = await TokenA.deploy();

    // TokenB = await ethers.getContractFactory("TokenB");
    // tokenB = await TokenA.deploy();

    // proxy contract deploy
    OwnedUpgradeabilityProxy = await ethers.getContractFactory(
      "OwnedUpgradeabilityProxy"
    );
    proxy = await OwnedUpgradeabilityProxy.deploy();

    // Deploy the TokenSaleUSDB contract
    TokenSaleUSDB = await ethers.getContractFactory("TokenSaleUSDB");
    masterAdmin = await TokenSaleUSDB.deploy();

    // Deploy the Admin contract
    Admin = await ethers.getContractFactory("Admin");
    admin = await Admin.connect(accounts).deploy();

    await admin.connect(accounts).initialize(owner.address);

    await admin.connect(owner).setMasterContractUSDB(masterAdmin.address);

    WETH9 = await ethers.getContractFactory("WETH9");
    wETH = await WETH9.connect(owner).deploy();

    UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await UniswapV2Factory.connect(owner).deploy(owner.address);

    UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
    router = await UniswapV2Router02.connect(owner).deploy(
      factory.address,
      wETH.address
    );

    await proxy.upgradeTo(admin.address);
    ProxyAddress = await admin.attach(proxy.address);
    await ProxyAddress.initialize(admin.address);
  });

  it("should check deployment", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 20,
      5000,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("5"),
      true,
    ];

    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("5"),
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
  });
  it("Should setConfig", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 20,
      5000,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("5"),
      true,
    ];

    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("5"),
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);
  });
  it("should check require already trigered", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 2000,
      5000,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("5"),
        ethers.utils.parseEther("500"),
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);
    await expect(
      masterAdmin
        .connect(user1)
        .setConfig([0, 10, 30, 4, 5000, 0], user1.address)
    ).to.be.revertedWith("Already triggered");
  });
  it("should check require as 0 deposit", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 200,
      5000,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("5"),
        ethers.utils.parseEther("500"),
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);

    await ethers.provider.send("evm_increaseTime", [10]);

    await expect(
      masterAdmin.connect(user2).deposit(ethers.utils.parseEther("0"))
    ).to.be.revertedWith("0 deposit");
  });
  it("should check require upto max allocation", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 200,
      5000,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("5"),
        ethers.utils.parseEther("500"),
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);

    await ethers.provider.send("evm_increaseTime", [10]);
    await expect(
      masterAdmin.connect(user2).deposit(ethers.utils.parseEther("100"))
    ).to.be.revertedWith("upto max allocation");
  });
  it("should check deposit by some user ", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 200,
      5000,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("5"),
        ethers.utils.parseEther("500"),
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);
    await ethers.provider.send("evm_increaseTime", [10]);

    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
  });
  it("should take raised amount of usdb", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 200,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
    await ethers.provider.send("evm_increaseTime", [300]);
    const ownerUSDB_Balance = await usdb.balanceOf(owner.address);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    const masterAdmin_Balance = await usdb.balanceOf(masterAdmin.address);
    await masterAdmin.takeUSDBRaised();
    const masterAdmin_BalanceAfter = await usdb.balanceOf(masterAdmin.address);
  });
  it("should check already paid", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 500,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
    await ethers.provider.send("evm_increaseTime", [600]);
    const ownerUSDB_Balance = await usdb.balanceOf(owner.address);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    const masterAdmin_Balance = await usdb.balanceOf(masterAdmin.address);

    await masterAdmin.takeUSDBRaised();
    const masterAdmin_BalanceAfter = await usdb.balanceOf(masterAdmin.address);

    await expect(masterAdmin.takeUSDBRaised()).to.be.revertedWith(
      "Already paid"
    );
  });
  it("should add liquidity", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 1500,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
    await ethers.provider.send("evm_increaseTime", [1500]);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    await masterAdmin.takeUSDBRaised();
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);
    await masterAdmin.connect(user1).addLiq();
  });

  it("should claimLP", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 3500,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
    await ethers.provider.send("evm_increaseTime", [3500]);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    await masterAdmin.takeUSDBRaised();
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);
    await masterAdmin.connect(user1).addLiq();
    await masterAdmin.claimLP();
  });
  it("Should check require takeUSDBRaised not called of addLiq", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 200,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    await expect(masterAdmin.connect(user1).addLiq()).to.be.revertedWith(
      "takeUSDBRaised not called"
    );
  });
  it("should check require liqAdded", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 6500,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
    await ethers.provider.send("evm_increaseTime", [6500]);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    await masterAdmin.takeUSDBRaised();
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);
    await masterAdmin.connect(user1).addLiq();
    await expect(masterAdmin.connect(user1).addLiq()).to.be.revertedWith(
      "liqAdded"
    );
  });
  it("Should check require no deposit in Claim", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 19500,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
    await ethers.provider.send("evm_increaseTime", [19500]);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));

    await masterAdmin.takeUSDBRaised();
    const masterAdmin_BalanceAfter = await usdb.balanceOf(masterAdmin.address);
    await expect(masterAdmin.claim()).to.be.revertedWith("No Deposit");
  });
  it("should check require takeUSDBRaised not called in claim", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 200,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await expect(masterAdmin.claim()).to.be.revertedWith(
      "takeUSDBRaised not called"
    );
  });
  it("should check vesting", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 50000,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("70"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("500"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("10"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("10"));
    await ethers.provider.send("evm_increaseTime", [50000]);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    await masterAdmin.takeUSDBRaised();
    await masterAdmin
      .connect(user1)
      .setConfig([0, 10, 30, 4, 5000, 0], user1.address);
    await masterAdmin.connect(user1).addLiq();
    await ethers.provider.send("evm_increaseTime", [300]);

    await masterAdmin.connect(user2).vesting();
  });
  it("Should Claim", async function () {
    const _params = [
      tokenA.address,
      router.address,
      ethers.utils.parseEther("10000"),
      Math.floor(Date.now() / 1000) + 10,
      Math.floor(Date.now() / 1000) + 100000,
      500n,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("30"),
      true,
    ];
    await masterAdmin
      .connect(user1)
      .initialize(
        _params,
        admin.address,
        user1.address,
        ethers.utils.parseEther("10"),
        500,
        false
      );
    await masterAdmin.connect(owner).setUSDB(usdb.address);
    await usdb.transfer(user2.address, ethers.utils.parseEther("100"));
    await usdb.transfer(user3.address, ethers.utils.parseEther("100"));

    await ethers.provider.send("evm_increaseTime", [10]);
    await usdb
      .connect(user2)
      .approve(masterAdmin.address, ethers.utils.parseEther("60"));
    await usdb
      .connect(user3)
      .approve(masterAdmin.address, ethers.utils.parseEther("60"));
    await masterAdmin.connect(user2).deposit(ethers.utils.parseEther("20"));
    await masterAdmin.connect(user3).deposit(ethers.utils.parseEther("20"));
    await ethers.provider.send("evm_increaseTime", [100000]);
    await tokenA
      .connect(owner)
      .transfer(masterAdmin.address, ethers.utils.parseEther("10100"));
    await masterAdmin.takeUSDBRaised();
    await masterAdmin.connect(user2).canClaim(user2.address);

    await masterAdmin.connect(user2).claim();
  });
});
