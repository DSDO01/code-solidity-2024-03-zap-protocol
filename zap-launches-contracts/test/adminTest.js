const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Admin Contract", function () {
  let owner;
  let accounts;
  let user1;

  let OwnedUpgradeabilityProxy;
  let proxy;
  let ProxyAddress;

  let Admin;
  let admin;

  beforeEach(async function () {
    [owner, accounts, user1] = await ethers.getSigners();
    // Deploy the Admin contract
    Admin = await ethers.getContractFactory("Admin");
    admin = await Admin.connect(accounts).deploy();

    // proxy contract deploy
    OwnedUpgradeabilityProxy = await ethers.getContractFactory(
      "OwnedUpgradeabilityProxy"
    );
    proxy = await OwnedUpgradeabilityProxy.deploy();

    await proxy.upgradeTo(admin.address);
    ProxyAddress = await admin.attach(proxy.address);
    await ProxyAddress.initialize(accounts.address);
    await ProxyAddress.grantRole("0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c", accounts.address);
  });
  it("Admin:- setWallet",async function(){
    await ProxyAddress.connect(accounts).setWallet(user1.address)
    await expect(await ProxyAddress.wallet()).to.be.equal(user1.address);
  })
  it("Admin:- addOperator",async function(){
    await ProxyAddress.connect(accounts).addOperator(user1.address)
  })
  it("Admin:- removeOperator",async function(){
    await ProxyAddress.connect(accounts).addOperator(user1.address)
    await ProxyAddress.connect(accounts).removeOperator(user1.address)
  })
  it("Should setPlatformFee",async function(){
    await ProxyAddress.connect(accounts).setPlatformFee(5);
    const PLatformFee=await ProxyAddress.platformFee();
    await expect(PLatformFee).to.be.equal(5);
  });
  it("Should setPlatformTax",async function(){
    await ProxyAddress.connect(accounts).setPlatformTax(5);
    const platformTax=await ProxyAddress.platformTax();
    await expect(platformTax).to.be.equal(5);
  })

});
