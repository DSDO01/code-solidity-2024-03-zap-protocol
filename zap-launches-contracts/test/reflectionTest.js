const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;

describe("Reflection Token Contract", async () => {
  let owner;
  let user1;
  let user2;
  let Weth;
  let weth;
  let Factory;
  let Router;
  let getinit;
  let Getinit;
  let factory;
  let router;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    Weth = await ethers.getContractFactory("WETH");
    weth = await Weth.deploy();
    await weth.deployed();
    // console.log("Weth address: ", weth.address);

    Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await Factory.deploy(owner.address);
    await factory.deployed();

    Router = await ethers.getContractFactory("UniswapV2Router01");
    router = await Router.deploy(factory.address, weth.address);
    await router.deployed();
    // console.log(router.address);

    // getinit = await ethers.getContractFactory("CallHash");
    // Getinit = await getinit.deploy();
    // await Getinit.deployed();
    // console.log("init", await Getinit.getInitHash());

    Reflection = await ethers.getContractFactory("ReflectionToken");
    const taxes = { transaction: 3, buy: 6, sell: 8 }; // Example taxes values

    reflection = await Reflection.deploy(
      router.address,
      owner.address,
      ethers.utils.parseUnits("1000000", 0),
      "ReflectionToken",
      "REFL",
      ethers.utils.parseUnits("501", 0),
      taxes
    );
    await reflection.deployed();
  });

  it("check initialization", async function () {
    expect(await reflection.balanceOf(owner.address)).to.be.equal(
      ethers.utils.parseUnits("1000000", 0)
    );
    // console.log("balance", String(await reflection.balanceOf(owner.address)));
    expect(
      reflection.connect(owner).excludeFromReward(reflection.pair())
    ).to.be.revertedWith("Account is already excluded");
  });
  it("should check total Supply",async function(){
    await reflection.totalSupply();
  })
  it("should Transfer from Owner to user Single Transfer and takeFee=0", async function () {
    await reflection
      .connect(owner)
      .transfer(user1.address, ethers.utils.parseUnits("100", 0));

    expect(await reflection.balanceOf(owner.address)).to.be.equal(
      ethers.utils.parseUnits("999900", 0)
    );
    expect(await reflection.balanceOf(user1.address)).to.be.equal(
      ethers.utils.parseUnits("100", 0)
    );
    const user1_balance = await reflection
      .connect(owner)
      .balanceOf(user1.address);
    // console.log("balance", String(await reflection.balanceOf(owner.address)));
  });
  it("Should do multiple transfer among users and takeFee=3", async function () {
    await reflection
      .connect(owner)
      .transfer(user1.address, ethers.utils.parseUnits("1000", 0));
    await reflection
      .connect(user1)
      .transfer(user2.address, ethers.utils.parseUnits("500", 0));

    expect(await reflection.balanceOf(user1.address)).to.be.equal(
      ethers.utils.parseUnits("500", 0)
    );
    expect(await reflection.balanceOf(user2.address)).to.be.equal(
      ethers.utils.parseUnits("499", 0)
    );
  });

  it("should use transferFrom", async function () {
    await reflection
      .connect(owner)
      .transfer(user1.address, ethers.utils.parseUnits("1000", 0));
    await reflection
      .connect(user1)
      .approve(owner.address, ethers.utils.parseUnits("600", 0));
    await reflection
      .connect(owner)
      .transferFrom(
        user1.address,
        user2.address,
        ethers.utils.parseUnits("500", 0)
      );
    expect(await reflection.balanceOf(user1.address)).to.be.equal(
      ethers.utils.parseUnits("500", 0)
    );
    expect(await reflection.balanceOf(user2.address)).to.be.equal(
      ethers.utils.parseUnits("499", 0)
    );
  });

  it("should do transfer from pair address and takeFee=1,2", async function () {
    const pair_address = await reflection.pair();
    const PairFactory = await ethers.getContractFactory("UniswapV2Pair");
    const Pair_instance = PairFactory.attach(pair_address);
    const path = [weth.address, reflection.address];

    await reflection
      .connect(owner)
      .approve(router.address, ethers.utils.parseUnits("50000", 0));
    await router
      .connect(owner)
      .addLiquidityETH(
        reflection.address,
        ethers.utils.parseUnits("50000", 0),
        ethers.utils.parseUnits("2", 0),
        ethers.utils.parseUnits("1", 0),
        owner.address, //LP Token holder addres
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: ethers.utils.parseUnits("1000", 0) }
      );
    await router
      .connect(user1)
      .swapETHForExactTokens(
        ethers.utils.parseUnits("10", 0),
        path,
        user1.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: ethers.utils.parseUnits("1000", 0) }
      );
    expect(await reflection.balanceOf(owner.address)).to.be.equal(
      ethers.utils.parseUnits("950000", 0)
    );
    expect(await reflection.balanceOf(user1.address)).to.be.equal(
      ethers.utils.parseUnits("10", 0)
    );
    expect(await reflection.balanceOf(pair_address)).to.be.equal(
      ethers.utils.parseUnits("49990", 0)
    );
  });

  it("should check whether excluded or not",async function(){
    const result=await reflection.isExcludedFromReward(owner.address)
     expect(result).to.be.equal(false);
  })

  it("should add a account to be excluded",async function(){
    await reflection.connect(owner).excludeFromReward(user2.address);
    await expect(
      reflection.connect(owner).excludeFromReward(user2.address)
    ).to.be.revertedWith("Account is already excluded");
  })

  it("should include a excluded account",async function(){
    await reflection.connect(owner).excludeFromReward(user2.address);
   await expect(
      reflection.connect(owner).excludeFromReward(user2.address)
    ).to.be.revertedWith("Account is already excluded");
    await reflection.connect(owner).includeInReward(user2.address);
  })
  
  it("Should Exclude from fee",async function(){
    await reflection.connect(owner).excludeFromFee(user1.address);
    const result=await reflection.connect(owner).isExcludedFromFee(user1.address)
    await expect(result).to.be.equal(true);
  })
})