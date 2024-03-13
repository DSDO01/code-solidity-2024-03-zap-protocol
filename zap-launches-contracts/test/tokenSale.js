const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time,constants } = require("@openzeppelin/test-helpers");
const { string } = require("hardhat/internal/core/params/argumentTypes");

const { BigNumber } = ethers;

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

    it("testing for initialize in TokenSaleETH", async function () {
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
    });

    it("testing for setConfig in TokenSaleETH", async function () {
             
        await masterAdmin.connect(user1).initialize(
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
            user1.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );
        await masterAdmin.connect(user1).setConfig(
            [0, 10, 30, 4, 5000, 0], user1.address
        ); 
    });

    it("testing for require => (Only Creator can Call) in setConfig function", async function () {
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
        await expect( masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], user1.address
        )).to.be .revertedWith("Only Creator can Call");
    });

    it("testing for require => (Already triggered) in setConfig function", async function () {
             
        await masterAdmin.connect(user1).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 10,
                Math.floor(Date.now() / 1000) + 200,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("3"),
                true
            ],
            admin.address,
            user1.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );
        await masterAdmin.connect(user1).setConfig(
            [0, 10, 30, 4, 5000, 0], user1.address
        )
        await expect( masterAdmin.connect(user1).setConfig(
            [0, 10, 30, 4, 5000, 0], user1.address
        )).to.be.revertedWith("Already triggered");   
    });

    it("testing for deposit in TokenSaleETH", async function () {
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 120,
                Math.floor(Date.now() / 1000) + 2000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        );

        await ethers.provider.send("evm_increaseTime", [2*60]);       
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("4")});
        
    });

    it("testing for require => (KYC not done) deposit funtion", async function () {
       
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 120,
                Math.floor(Date.now() / 1000) + 2000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            true
            );
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )

        await ethers.provider.send("evm_increaseTime", [2*60]);       
        await expect(masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("4")})).to.be.revertedWith("KYC not done");   
    });


    it("testing for require => (upto max allocation) deposit funtion", async function () {
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 120,
                Math.floor(Date.now() / 1000) + 2000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [2*60]);       
        await expect(masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("7")})).to.be.revertedWith("upto max allocation");

        
    });

    it("testing for require => (Incorrect time) deposit funtion", async function () {
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )

        await ethers.provider.send("evm_increaseTime", [60]);       

        await expect(masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("4")})).to.be.revertedWith("Incorrect time");   
    });

    it("testing for require => (0 deposit) deposit funtion", async function () {
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 2000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )

        await ethers.provider.send("evm_increaseTime", [11*60]);       
        await expect(masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("0")})).to.be.revertedWith("0 deposit");   
    });

    it("testing for takeUSDBRaised in TokenSaleETH", async function () {
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 2000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );

        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10000"));
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        );

        await ethers.provider.send("evm_increaseTime", [10*60]);       
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("4")});
       
        await ethers.provider.send("evm_increaseTime", [40*60]);       
        await masterAdmin.connect(user1).takeUSDBRaised();
   
    });

    it("testing for require => (Not time yet) takeUSDBRaised funtion", async function () {
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 50000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );

        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10000"));
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        );

        await ethers.provider.send("evm_increaseTime", [50*60]);       
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("4")});
       
        await ethers.provider.send("evm_increaseTime", [20*60]);       
        await expect( masterAdmin.connect(user1).takeUSDBRaised()).to.be.revertedWith("Not time yet");
   
    });

    it("testing for require => (Already paid) takeUSDBRaised funtion", async function () {
        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 1000000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("4"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("5"),
            500,
            false
            );

        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10000"));
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        );

        await ethers.provider.send("evm_increaseTime", [10*60]);       
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("4")});
        await ethers.provider.send("evm_increaseTime", [1000000]);       
        await masterAdmin.connect(user1).takeUSDBRaised();

        await expect(masterAdmin.connect(user1).takeUSDBRaised()).to.be.revertedWith("Already paid");
   
    });

    it("testing for addLiq", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 2000000,
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
            [0, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        
        await ethers.provider.send("evm_increaseTime", [2000000]);
        await masterAdmin.connect(user1).takeUSDBRaised();

        await ethers.provider.send("evm_increaseTime", [2000]);       

        await masterAdmin.connect(user1).addLiq();
        const contract_Balance = await tokenA.connect(user1).balanceOf(masterAdmin.address);
        expect(contract_Balance).to.be.equal(ethers.utils.parseEther("6040"));
    });

    it("testing for require => (takeUSDBRaised not called) in addLiq funtion", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 5000000,
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
            [0, 10, 30, 4, 5000, 20000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        await expect(masterAdmin.connect(user1).addLiq()).to.be.revertedWith("takeUSDBRaised not called");
    });

    it("testing for require => (Lockin period is not over yet) in addLiq funtion", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 6000000,
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
            [0, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
       
        await ethers.provider.send("evm_increaseTime", [6000000]);       
        await masterAdmin.connect(user1).takeUSDBRaised();
        await expect( masterAdmin.connect(user1).addLiq()).to.be.revertedWith("Lockin period is not over yet");
    });

    it("testing for require => (liqAdded) in addLiq funtion", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 10000000,
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
            [0, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        
        await ethers.provider.send("evm_increaseTime", [10000000]);
        await masterAdmin.connect(user1).takeUSDBRaised();

        await ethers.provider.send("evm_increaseTime", [40*60]);       

        await masterAdmin.connect(user1).addLiq();
        await expect(masterAdmin.connect(user1).addLiq()).to.be.revertedWith("liqAdded");

    });

    it("testing for claimLP", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 20000000,
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
            [0, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        
        await ethers.provider.send("evm_increaseTime", [20000000]);
        await masterAdmin.connect(user1).takeUSDBRaised();

        await ethers.provider.send("evm_increaseTime", [40*60]);       

        await masterAdmin.connect(user1).addLiq();
        const contract_Balance = await tokenA.connect(user1).balanceOf(masterAdmin.address);

        await masterAdmin.connect(user1).claimLP();
        expect(contract_Balance).to.be.equal(ethers.utils.parseEther("6040"));
    });

    it("testing for require => (takeUSDBRaised || addliq not called) in claimLP function", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 40000000,
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
            [0, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        
        await ethers.provider.send("evm_increaseTime", [40000000]);
        await masterAdmin.connect(user1).takeUSDBRaised();

        await expect(masterAdmin.connect(user1).claimLP()).to.be.revertedWith("takeUSDBRaised || addliq not called");
    });

    it("testing for require => (Lockin period is not over yet) in claimLP function", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 90000000,
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
            [6000, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        
        await ethers.provider.send("evm_increaseTime", [90000000]);
        await masterAdmin.connect(user1).takeUSDBRaised();

        await ethers.provider.send("evm_increaseTime", [40*60]);       

        await masterAdmin.connect(user1).addLiq();
        const contract_Balance = await tokenA.connect(user1).balanceOf(masterAdmin.address);

        await expect(masterAdmin.connect(user1).claimLP()).to.be.revertedWith("Lockin period is not over yet");
        expect(contract_Balance).to.be.equal(ethers.utils.parseEther("6040"));
    });

    it("testing for claimLP", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 200000000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("10"),
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
            [0, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        await masterAdmin.connect(user2).deposit({value: ethers.utils.parseEther("5")});
        await masterAdmin.connect(user3).deposit({value: ethers.utils.parseEther("8")});
        
        await ethers.provider.send("evm_increaseTime", [200000000]);
        await masterAdmin.connect(owner).takeUSDBRaised();

        await masterAdmin.connect(user1).claim();
    });

    it("testing for require => (takeUSDBRaised not called) in claimLP funtion", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 600,
                Math.floor(Date.now() / 1000) + 400000000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("10"),
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
            [0, 10, 30, 4, 5000, 2000], owner.address
        )
        await ethers.provider.send("evm_increaseTime", [10*60]);
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});
        await masterAdmin.connect(user2).deposit({value: ethers.utils.parseEther("5")});
        await masterAdmin.connect(user3).deposit({value: ethers.utils.parseEther("8")});
        await ethers.provider.send("evm_increaseTime", [400000000]);

        await expect(masterAdmin.connect(user1).claim()).to.be.revertedWith("takeUSDBRaised not called")
    });


    it("testing for vesting", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 10,
                Math.floor(Date.now() / 1000) + 800000000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("5"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("3"),
            500,
            false
            );
        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10100"));
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )
        
        await masterAdmin.connect(owner).deposit({value: ethers.utils.parseEther("3")});        
        await ethers.provider.send("evm_increaseTime", [800000000]);
        await masterAdmin.connect(owner).takeUSDBRaised();
        
        await masterAdmin.connect(owner).addLiq();
        await ethers.provider.send("evm_increaseTime", [40]);

        // stake = await masterAdmin.connect(owner).stakes(owner.address)
        // console.log("stake",String(stake[0]), String(stake[1]));

        await masterAdmin.connect(owner).vesting();
    });

    it("testing for require => (takeUSDBRaised || addLiq not called) in vesting function", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 10,
                Math.floor(Date.now() / 1000) + 2000000000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("5"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("3"),
            500,
            false
            );
        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10100"));
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )
        
        await masterAdmin.connect(owner).deposit({value: ethers.utils.parseEther("3")});        
        await ethers.provider.send("evm_increaseTime", [2000000000]);
        await expect(masterAdmin.connect(owner).vesting()).to.be.revertedWith("takeUSDBRaised || addLiq not called");
    });

    it("testing for require => (vesting period is not over yet) in vesting function", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 10,
                Math.floor(Date.now() / 1000) + 4000000000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("5"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("3"),
            500,
            false
            );
        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10100"));
        await masterAdmin.connect(owner).setConfig(
            [0, 120, 30, 4, 5000, 0], owner.address
        )
        
        await masterAdmin.connect(owner).deposit({value: ethers.utils.parseEther("3")});        
        await ethers.provider.send("evm_increaseTime", [4000000000]);

        await masterAdmin.connect(owner).takeUSDBRaised();
        
        await masterAdmin.connect(owner).addLiq();
        await ethers.provider.send("evm_increaseTime", [60]);

        await expect(masterAdmin.connect(owner).vesting()).to.be.revertedWith("vesting period is not over yet");
    });

    it("testing for require => (Not time or not allowed) in vesting function", async function () {

        await masterAdmin.connect(owner).initialize(
            [tokenA.address,
                router.address,
                ethers.utils.parseEther("10000"),
                Math.floor(Date.now() / 1000) + 10,
                Math.floor(Date.now() / 1000) + 8000000000,
                5000,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("5"),
                true
            ],
            admin.address,
            owner.address,
            ethers.utils.parseEther("3"),
            500,
            false
            );
        await tokenA.connect(owner).transfer(masterAdmin.address,ethers.utils.parseEther("10100"));
        await masterAdmin.connect(owner).setConfig(
            [0, 10, 30, 4, 5000, 0], owner.address
        )
        
        await masterAdmin.connect(user1).deposit({value: ethers.utils.parseEther("3")});        
        await ethers.provider.send("evm_increaseTime", [8000000000]);
        await masterAdmin.connect(user1).takeUSDBRaised();
        
        await masterAdmin.connect(user1).addLiq();
        await admin.connect(owner).grantRole("0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c", owner.address);
        await admin.connect(owner).setClaimBlock(masterAdmin.address);
        
        await ethers.provider.send("evm_increaseTime", [40]);
        await expect(masterAdmin.connect(user1).vesting()).to.be.revertedWith("Not time or not allowed");
    });

});
