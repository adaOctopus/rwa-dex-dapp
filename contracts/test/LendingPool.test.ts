import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("LendingPool", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken");
    const token = await TestToken.deploy("Test Token", "TKN");
    await token.waitForDeployment();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy(await token.getAddress());
    await lendingPool.waitForDeployment();

    return { owner, user1, user2, token, lendingPool };
  }

  describe("Minting", function () {
    it("Should mint cTokens when supplying", async function () {
      const { token, lendingPool, user1 } = await loadFixture(deployFixture);
      
      const amount = ethers.parseEther("1000");
      await token.approve(await lendingPool.getAddress(), amount);
      await lendingPool.connect(user1).mint(amount);
      
      const cTokenBalance = await lendingPool.balanceOf(user1.address);
      expect(cTokenBalance).to.be.gt(0);
    });
  });

  describe("Borrowing", function () {
    it("Should allow borrowing with sufficient collateral", async function () {
      const { token, lendingPool, user1 } = await loadFixture(deployFixture);
      
      // Supply first
      const supplyAmount = ethers.parseEther("1000");
      await token.approve(await lendingPool.getAddress(), supplyAmount);
      await lendingPool.connect(user1).mint(supplyAmount);
      
      // Borrow
      const borrowAmount = ethers.parseEther("500");
      await lendingPool.connect(user1).borrow(borrowAmount);
      
      const borrowBalance = await lendingPool.borrowBalanceStored(user1.address);
      expect(borrowBalance).to.equal(borrowAmount);
    });

    it("Should prevent borrowing without sufficient collateral", async function () {
      const { token, lendingPool, user1 } = await loadFixture(deployFixture);
      
      const supplyAmount = ethers.parseEther("100");
      await token.approve(await lendingPool.getAddress(), supplyAmount);
      await lendingPool.connect(user1).mint(supplyAmount);
      
      const borrowAmount = ethers.parseEther("1000");
      await expect(lendingPool.connect(user1).borrow(borrowAmount)).to.be.reverted;
    });
  });

  describe("Repayment", function () {
    it("Should allow repaying borrowed amount", async function () {
      const { token, lendingPool, user1 } = await loadFixture(deployFixture);
      
      // Supply and borrow
      const supplyAmount = ethers.parseEther("1000");
      await token.approve(await lendingPool.getAddress(), supplyAmount * 2n);
      await lendingPool.connect(user1).mint(supplyAmount);
      
      const borrowAmount = ethers.parseEther("500");
      await lendingPool.connect(user1).borrow(borrowAmount);
      
      // Repay
      await lendingPool.connect(user1).repayBorrow(borrowAmount);
      const borrowBalance = await lendingPool.borrowBalanceStored(user1.address);
      expect(borrowBalance).to.equal(0);
    });
  });
});

