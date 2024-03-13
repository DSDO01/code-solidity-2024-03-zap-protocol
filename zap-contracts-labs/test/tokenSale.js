const { expect } = require("chai");
const { ethers } = require("hardhat");
// const {mineBlocks} = require("../../launchpad-contracts/test/utilities/utilities");

const {
  time, // time
  constants,
} = require("@openzeppelin/test-helpers");
const ether = require("@openzeppelin/test-helpers/src/ether");

const BN = require("ethers").BigNumber;

const duration = {
  seconds(val) {
    return BN.from(val);
  },
  minutes(val) {
    return BN.from(val).mul(this.seconds("60"));
  },
  hours(val) {
    return new BN.from(val).mul(this.minutes("60"));
  },
  days(val) {
    return new BN.from(val).mul(this.hours("24"));
  },
  weeks(val) {
    return new BN.from(val).mul(this.days("7"));
  },
  years(val) {
    return new BN.from(val).mul(this.days("365"));
  },
};

describe("TokenSale Contract", () => {
  beforeEach(async () => {
    Admin = await ethers.getContractFactory("Admin");
    SuperCharge = await ethers.getContractFactory("SuperCharge");
    TokenSale = await ethers.getContractFactory("TokenSale");
    TokenUSDC = await ethers.getContractFactory("USDCWithSixDecimal");
    Staking = await ethers.getContractFactory("Staking");
    Oracle = await ethers.getContractFactory("ChainLink");
    Rewards = await ethers.getContractFactory("Rewards");
    Weth = await ethers.getContractFactory("WETH");
    Pair = await ethers.getContractFactory("UniswapV2Pair");
    Factory = await ethers.getContractFactory("UniswapV2Factory");
    Router = await ethers.getContractFactory("UniswapV2Router01");
    [owner] = await ethers.getSigners();
    accounts = await ethers.getSigners();
    provider = await ethers.provider;
    hash = await ethers.getContractFactory("CallHash");
    ion = await ethers.getContractFactory("ION");

    hashReq = await hash.deploy();
    await hashReq.deployed();

    const getHash = await hashReq.getInitHash();
    console.log("getHash", getHash);

    tokenUSDC = await TokenUSDC.deploy("USDC", "USDC");
    await tokenUSDC.deployed();
    console.log("tokenUSDC address", tokenUSDC.address);
    console.log("owner address", owner.address);

    tokenSaleContract = await TokenSale.deploy();
    await tokenSaleContract.deployed();

    oracle = await Oracle.deploy();
    await oracle.deployed();

    factory = await Factory.deploy(owner.address);
    await factory.deployed();

    weth = await Weth.deploy();
    await weth.deployed();

    router = await Router.deploy(factory.address, weth.address);
    await router.deployed();

    adminContract = await Admin.deploy();
    await adminContract.deployed();
    await adminContract.initialize(owner.address);

    ionToken = await ion.deploy(
      // for staking
      "Lithium",
      "ION",
      BN.from("6000000").mul(BN.from("10").pow("18")),

      router.address,
      owner.address,
      owner.address, //user1
      owner.address, //user1
      owner.address, //user1
      // adminContract.address,
      tokenUSDC.address
    );
    await ionToken.deployed();

    rewards = await Rewards.deploy();
    await rewards.deployed();
    await rewards.initialize(
      adminContract.address,
      ionToken.address,
      router.address,
      owner.address
    );

    superCharge = await SuperCharge.deploy();
    await superCharge.deployed();
    await superCharge.initialize(adminContract.address, ionToken.address);

    const IonReq = [
      [200000, 600000, 1000000, 2500000, 5000000, 7000000],
      [200000, 600000, 1000000, 2500000, 5000000, 7000000],
      [200000, 600000, 1000000, 2500000, 5000000, 7000000],
      [200000, 600000, 1000000, 2500000, 5000000, 7000000, 30000000],
    ];

    stakingContract = await Staking.deploy();
    await stakingContract.deployed();

    await stakingContract.initialize(
      ionToken.address,
      adminContract.address,
      router.address,
      weth.address,
      IonReq
    );

    await adminContract.addOperator(owner.address);
    await adminContract.setMasterContract(tokenSaleContract.address);
    await adminContract.setStakingContract(stakingContract.address);
    await adminContract.setAirdrop(rewards.address);
    await adminContract.setSuperCharge(superCharge.address);

    await adminContract.setSuperCharge(superCharge.address);
    await adminContract.addOperator(owner.address);

    console.log("operator hash", await adminContract.OPERATOR());

    console.log(
      "role check:",
      await adminContract.hasRole(
        "0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c",
        owner.address
      )
    );

    const allocationArr = [
      [15, 75, 150, 350, 750, 1125],
      [30, 115, 225, 550, 1125, 1650],
      [60, 225, 350, 825, 1650, 2350],
      [200, 600, 850, 1650, 2350, 3000, 7500],
    ];

    await stakingContract.setAllocations(allocationArr);
    console.log(
      "ionToken balance at owner address",
      String(await ionToken.balanceOf(owner.address))
    );

    await ionToken.transfer(
      accounts[1].address,
      BN.from("400000").mul(BN.from("10").pow("18"))
    );
    console.log(
      "owner.address",
      String(await ionToken.balanceOf(owner.address))
    );

    await tokenUSDC.transfer(
      accounts[1].address,
      BN.from("4000").mul(BN.from("10").pow("6"))
    );
    // await tokenUSDC.transfer(accounts[2].address,BN.from("40").mul(BN.from("10").pow("6")));
    await tokenUSDC.transfer(
      owner.address,
      BN.from("40").mul(BN.from("10").pow("6"))
    );

    await ionToken
      .connect(accounts[1])
      .approve(
        stakingContract.address,
        BN.from("600000000000000000000000000000").mul(BN.from("10").pow("18"))
      );

    await ionToken
      .connect(owner)
      .approve(
        router.address,
        BN.from("60000000000000000000000000000000").mul(BN.from("10").pow("18"))
      );

    await ionToken
      .connect(owner)
      .approve(
        rewards.address,
        BN.from("60000000000000000000000000000000").mul(BN.from("10").pow("18"))
      );

    // console.log("matic - airdrop initial ", String (await weth.balanceOf(rewards.address)));
    // console.log("rewards balance before  ", String(await rewards.viewBalance()));

    console.log(
      "alloc account 1 before is ---------",
      String(await stakingContract.getAllocationOf(accounts[1].address))
    );

    await stakingContract
      .connect(accounts[1])
      .stake(2, BN.from("200000").mul(BN.from("10").pow("18")), {
        value: BN.from("1").mul(BN.from("10").pow("18")),
      });

    console.log(
      "alloc account 1 AFTER is ---------",
      String(await stakingContract.getAllocationOf(accounts[1].address))
    );

    now = (await time.latest()).toNumber();
    const newNow = BN.from(now).add(duration.minutes(2)); // ido for 3 min
    end = BN.from(now).add(duration.minutes(5));

    defaultParams = {
      totalSupply: BN.from("10").mul(BN.from("10").pow("6")),
      privateStart: String(newNow),
      privateTokenPrice: BN.from("1").mul(BN.from("10").pow("6")),
      privateEnd: String(end),
    };

    const maxAllocation = 1000; // max limit of allocation
    const globalTaxRate = 50; // normal users 5% base 1000
    const isKYCEnabled = false; // free allocation for whitelisted users upto 500$
    const whitelistTxRate = 30; // whitelisted users 3% base 1000

    console.log("time now", now);
    console.log("private start: ", String(newNow));
    console.log("private end: ", String(end));

    const tx = await adminContract.createPool(
      defaultParams,
      maxAllocation,
      globalTaxRate,
      isKYCEnabled,
      whitelistTxRate
    );
    const receipt = await tx.wait();
    const event = receipt.events.filter((x) => x.event === "CreateTokenSale");
    defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
    // return event[0].args.instanceAddress;

    // console.log("left", left);
    await tokenUSDC
      .connect(accounts[1])
      .approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
  });

  describe("DEPOSIT", async () => {
    it("Deposit Fails if more than allocation deposited: ", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");
      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      // await defaultInstance.connect(owner).deposit(BN.from("40").mul(BN.from("10").pow("6")));
      await expect(
        defaultInstance
          .connect(owner)
          .deposit(BN.from("40").mul(BN.from("10").pow("0")))
      ).to.be.revertedWith("Upto allocation");
    });

    it("Deposit Fails if deposited before ido start ", async () => {
      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      // await defaultInstance.connect(owner).deposit(BN.from("40").mul(BN.from("10").pow("6")));
      await expect(
        defaultInstance
          .connect(owner)
          .deposit(BN.from("40").mul(BN.from("10").pow("0")))
      ).to.be.revertedWith("Incorrect time");
    });

    it("Deposit success with next level same tier allocation,for whitelisted users under whiteListTxFreeAllc", async () => {
      await defaultInstance.connect(owner).whitelistUser([accounts[1].address]);
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("40").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("15").mul(BN.from("10").pow("0")));
      console.log(
        "usdc bal of acc 1 before ",
        String(await tokenUSDC.balanceOf(accounts[1].address)) / 1000000
      );
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("15").mul(BN.from("10").pow("0")));
      console.log(
        "usdc bal of acc 1 after ",
        String(await tokenUSDC.balanceOf(accounts[1].address)) / 1000000
      );
    });

    it("Deposit success with next level same tier allocation,for whitelisted users beyond whiteListTxFreeAllc", async () => {
      await defaultInstance.connect(owner).whitelistUser([accounts[1].address]);
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("400").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("50").mul(BN.from("10").pow("0")));
      console.log(
        "usdc bal of acc 1 before ",
        String(await tokenUSDC.balanceOf(accounts[1].address)) / 1000000
      );
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("150").mul(BN.from("10").pow("0")));
      console.log(
        "usdc bal of acc 1 after ",
        String(await tokenUSDC.balanceOf(accounts[1].address)) / 1000000
      );
    });

    it("Deposit success with next level same tier allocation,for normal users", async () => {
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("40").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("15").mul(BN.from("10").pow("0")));
      console.log(
        "usdc bal of acc 1 before ",
        String(await tokenUSDC.balanceOf(accounts[1].address)) / 1000000
      );
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("15").mul(BN.from("10").pow("0")));
      console.log(
        "usdc bal of acc 1 after ",
        String(await tokenUSDC.balanceOf(accounts[1].address)) / 1000000
      );
    });

    it("Normal Deposit fails beyond MAX ALLOC LIMIT", async () => {
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("400").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("150").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("1500").mul(BN.from("10").pow("0")));
    });

    it("Basic Deposit Success", async () => {
      await ethers.provider.send("evm_increaseTime", [130]);
      await ethers.provider.send("evm_mine");
      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      await defaultInstance
        .connect(owner)
        .deposit(BN.from("30").mul(BN.from("10").pow("0")));
    });

    it("Basic Deposit Multiple time Success", async () => {
      await ethers.provider.send("evm_increaseTime", [130]);
      await ethers.provider.send("evm_mine");
      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      console.log(
        "allowance to defaultInstance",
        String(
          await tokenUSDC.allowance(owner.address, defaultInstance.address)
        )
      );
      await defaultInstance
        .connect(owner)
        .deposit(BN.from("20").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(owner)
        .deposit(BN.from("10").mul(BN.from("10").pow("0")));
    });
  });

  describe("CLAIM", async () => {
    it("Claim fails when claimed before ido end", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");
      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("20").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(owner)
        .deposit(BN.from("10").mul(BN.from("10").pow("0")));
      // await defaultInstance.connect(owner).claim();
      await expect(defaultInstance.connect(owner).claim()).to.be.revertedWith(
        "Not time or not allowed"
      );
    });

    it("Claim fails when claimed without deposit", async () => {
      await ethers.provider.send("evm_increaseTime", [350]);
      await ethers.provider.send("evm_mine");
      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      console.log(
        "allowance to defdeeaultInstance",
        String(
          await tokenUSDC.allowance(owner.address, defaultInstance.address)
        )
      );
      // await defaultInstance.connect(owner).claim();
      await expect(defaultInstance.connect(owner).claim()).to.be.revertedWith(
        "No Deposit"
      );
    });

    it("Claim fails when user is trying to claim again after claiming whole amount", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");
      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      await defaultInstance
        .connect(owner)
        .deposit(BN.from("20").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(owner)
        .deposit(BN.from("10").mul(BN.from("10").pow("0")));
      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");
      console.log(
        "owner token bal before claim",
        String(await tokenUSDC.balanceOf(owner.address))
      );
      await defaultInstance.connect(owner).claim();

      console.log(
        "owner token bal after claim",
        String(await tokenUSDC.balanceOf(owner.address))
      );

      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine");

      // await defaultInstance.connect(owner).claim();
      await expect(defaultInstance.connect(owner).claim()).to.be.revertedWith(
        "Already Claimed"
      );
    });

    it("Claim fails when token available in ido is more than user deposited usdc", async () => {
      now = (await time.latest()).toNumber();
      const newNow = BN.from(now).add(duration.minutes(2)); // ido for 3 min
      end = BN.from(now).add(duration.minutes(5));

      console.log("time now", now);
      console.log("private start: ", String(newNow));
      console.log("private end: ", String(end));

      const tx = await adminContract.createPool(defaultParams);
      const receipt = await tx.wait();
      const event = receipt.events.filter((x) => x.event === "CreateTokenSale");
      defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
      // // return event[0].args.instanceAddress;
      console.log("defaultInstance", defaultInstance.address);

      console.log(
        "owner alloc ",
        String(await stakingContract.getAllocationOf(owner.address))
      );

      console.log(
        "getParams",
        String(await adminContract.getParams(defaultInstance.address))
      );

      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      console.log(
        "allowance to defdeeaultInstance",
        String(
          await tokenUSDC.allowance(owner.address, defaultInstance.address)
        )
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("30").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "owner token bal before claim",
        String(await tokenUSDC.balanceOf(owner.address))
      );

      await expect(defaultInstance.connect(owner).claim()).to.be.revertedWith(
        "Nothing to claim"
      );

      console.log(
        "owner token bal after claim",
        String(await tokenUSDC.balanceOf(owner.address))
      );
    });

    it("Basic Claim Success", async () => {
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      console.log(
        "acc1 allocation",
        String(await stakingContract.getAllocationOf(accounts[1].address))
      );

      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("25").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "acc 1 token bal before claim",
        String((await tokenUSDC.balanceOf(accounts[1].address)) / 1000000)
      );

      await defaultInstance.connect(accounts[1]).claim();

      console.log(
        "acc 1 token bal after claim",
        String((await tokenUSDC.balanceOf(accounts[1].address)) / 1000000)
      );
    });

    it("Claim success for extra paid Tax by normal users", async () => {
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      console.log(
        "acc1 allocation",
        String(await stakingContract.getAllocationOf(accounts[1].address))
      );

      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("25").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("45").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "acc 1 token bal before claim",
        String((await tokenUSDC.balanceOf(accounts[1].address)) / 1000000)
      );

      await defaultInstance.connect(accounts[1]).claim();

      console.log(
        "acc 1 token bal after claim",
        String((await tokenUSDC.balanceOf(accounts[1].address)) / 1000000)
      );
    });

    it("Claim success for extra paid Tax by whitelisted users", async () => {
      await defaultInstance.connect(owner).whitelistUser([accounts[1].address]);

      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      console.log(
        "acc1 allocation",
        String(await stakingContract.getAllocationOf(accounts[1].address))
      );

      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("250").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("150").mul(BN.from("10").pow("0")));
      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("150").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "acc 1 token bal before claim",
        String((await tokenUSDC.balanceOf(accounts[1].address)) / 1000000)
      );

      await defaultInstance.connect(accounts[1]).claim();

      console.log(
        "acc 1 token bal after claim",
        String((await tokenUSDC.balanceOf(accounts[1].address)) / 1000000)
      );
    });
  });

  describe("TAKE USDC RAISED", async () => {
    it("takeUSDCRaised fails before pool end time", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("18").mul(BN.from("10").pow("6")));

      // await defaultInstance.takeUSDCRaised();
      await expect(defaultInstance.takeUSDCRaised()).to.be.revertedWith(
        "Not time yet"
      );
    });

    it("takeUSDCRaised fails if already usdc claimed by owner", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("18").mul(BN.from("10").pow("0")));
      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      await defaultInstance.takeUSDCRaised();
      // await defaultInstance.takeUSDCRaised();
      await expect(defaultInstance.takeUSDCRaised()).to.be.revertedWith(
        "Already paid"
      );
    });

    it("takeUSDCRaised success", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("18").mul(BN.from("10").pow("6")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "usdc token before take Left overs",
        String(await tokenUSDC.balanceOf(owner.address))
      );

      await defaultInstance.takeUSDCRaised();

      console.log(
        "token amount after take Left overs",
        String(await tokenUSDC.balanceOf(owner.address))
      );
    });

    it("takeUSDCRaised fails if other than owner is claming", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("18").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "usdc token before take Left overs",
        String(await tokenUSDC.balanceOf(owner.address))
      );

      await defaultInstance.connect(accounts[1]).takeUSDCRaised();
      console.log(
        "token amount after take Left overs",
        String(await tokenUSDC.balanceOf(owner.address))
      );
    });
  });

  describe("TAKE LOCKED", async () => {
    it("take locked fails, if owner wll try to withdraw usdc token from pool before private end + 30 days", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("18").mul(BN.from("10").pow("0")));

      // await defaultInstance.takeLocked();
      await expect(defaultInstance.takeLocked()).to.be.revertedWith(
        "Not ended"
      );
    });

    it("take locked success", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      console.log(
        "allowanc defaultInstance",
        String(
          await tokenUSDC.allowance(owner.address, defaultInstance.address)
        )
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("18").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [2592300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "take locked usdc token BEFORE",
        String(await tokenUSDC.balanceOf(owner.address))
      );
      await defaultInstance.takeLocked();
      console.log(
        "take locked usdc token AFTER",
        String(await tokenUSDC.balanceOf(owner.address))
      );
    });
  });

  describe("DESTROY", async () => {
    it("destroy success ", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      console.log(
        "allowanc defaultInstance",
        String(
          await tokenUSDC.allowance(owner.address, defaultInstance.address)
        )
      );

      console.log(
        "dhgyjh",
        String(await stakingContract.getAllocationOf(accounts[1].address))
      );

      await defaultInstance
        .connect(accounts[1])
        .deposit(BN.from("18").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      console.log(
        "owner token bal before claim",
        String(await tokenUSDC.balanceOf(owner.address))
      );
      await defaultInstance.connect(accounts[1]).claim();
      console.log(
        "owner token bal after claim",
        String(await tokenUSDC.balanceOf(owner.address))
      );

      await ethers.provider.send("evm_increaseTime", [3400]);
      await ethers.provider.send("evm_mine");

      console.log(
        "usdc token befor destroy",
        String(await tokenUSDC.balanceOf(defaultInstance.address))
      );
      const destroyed = await defaultInstance.connect(owner).destroy();
      console.log(
        "usdc token after destroy",
        String(await tokenUSDC.balanceOf(defaultInstance.address))
      );
    });
  });

  describe("REMOVE OTHER ERC20 TOKEN", async () => {
    it("RemoveOtherERC20Token fails if owner wants to withdraw usdc", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      console.log(
        "allowanc defaultInstance",
        String(
          await tokenUSDC.allowance(owner.address, defaultInstance.address)
        )
      );

      await defaultInstance
        .connect(owner)
        .deposit(BN.from("8").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      await ionToken.transfer(
        defaultInstance.address,
        BN.from("600").mul(BN.from("10").pow("18"))
      );
      // await defaultInstance.removeOtherERC20Tokens(tokenUSDC.address);
      await expect(
        defaultInstance.removeOtherERC20Tokens(tokenUSDC.address)
      ).to.be.revertedWith(" Can't withdraw usdc");
    });

    it("RemoveOtherERC20Token from any contract", async () => {
      await ethers.provider.send("evm_increaseTime", [150]);
      await ethers.provider.send("evm_mine");

      await tokenUSDC.approve(
        defaultInstance.address,
        BN.from("6000000000000000").mul(BN.from("10").pow("18"))
      );
      console.log(
        "allowanc defaultInstance",
        String(
          await tokenUSDC.allowance(owner.address, defaultInstance.address)
        )
      );
      await defaultInstance
        .connect(owner)
        .deposit(BN.from("8").mul(BN.from("10").pow("0")));

      await ethers.provider.send("evm_increaseTime", [300]);
      await ethers.provider.send("evm_mine");

      await ionToken.transfer(
        defaultInstance.address,
        BN.from("600").mul(BN.from("10").pow("18"))
      );
      console.log(
        "ion token befor removeOtherERC20Tokens",
        String(await ionToken.balanceOf(defaultInstance.address))
      );
      await defaultInstance.removeOtherERC20Tokens(ionToken.address);
      console.log(
        "ion token after removeOtherERC20Tokens",
        String(await ionToken.balanceOf(defaultInstance.address))
      );
    });
  });
});
