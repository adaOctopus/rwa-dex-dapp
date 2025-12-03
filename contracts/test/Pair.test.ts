import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Pair", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy WETH
    const WETH = await ethers.getContractFactory("WETH");
    const weth = await WETH.deploy();
    await weth.waitForDeployment();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy(owner.address);
    await factory.waitForDeployment();

    // Deploy Test Tokens
    const TestToken = await ethers.getContractFactory("TestToken");
    const tokenA = await TestToken.deploy("Token A", "TKA");
    await tokenA.waitForDeployment();
    const tokenB = await TestToken.deploy("Token B", "TKB");
    await tokenB.waitForDeployment();

    // Create Pair
    await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
    const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
    const pair = await ethers.getContractAt("Pair", pairAddress);

    return { owner, user1, user2, weth, factory, tokenA, tokenB, pair };
  }

  describe("Deployment", function () {
    it("Should create a pair", async function () {
      const { factory, tokenA, tokenB } = await loadFixture(deployFixture);
      const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Liquidity", function () {
    it("Should add liquidity", async function () {
      const { tokenA, tokenB, pair, user1 } = await loadFixture(deployFixture);
      
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");
      
      await tokenA.transfer(await pair.getAddress(), amountA);
      await tokenB.transfer(await pair.getAddress(), amountB);
      
      await pair.mint(user1.address);
      
      const lpBalance = await pair.balanceOf(user1.address);
      expect(lpBalance).to.be.gt(0);
    });

    it("Should remove liquidity", async function () {
      const { tokenA, tokenB, pair, user1 } = await loadFixture(deployFixture);
      
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");
      
      await tokenA.transfer(await pair.getAddress(), amountA);
      await tokenB.transfer(await pair.getAddress(), amountB);
      
      await pair.mint(user1.address);
      const lpBalance = await pair.balanceOf(user1.address);
      
      await pair.transfer(await pair.getAddress(), lpBalance);
      await pair.burn(user1.address);
      
      const balanceA = await tokenA.balanceOf(user1.address);
      const balanceB = await tokenB.balanceOf(user1.address);
      expect(balanceA).to.be.gt(0);
      expect(balanceB).to.be.gt(0);
    });
  });

  describe("Swap", function () {
    it("Should swap tokens", async function () {
      const { tokenA, tokenB, pair, user1 } = await loadFixture(deployFixture);
      
      // Add liquidity first
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");
      await tokenA.transfer(await pair.getAddress(), amountA);
      await tokenB.transfer(await pair.getAddress(), amountB);
      await pair.mint(user1.address);
      
      // Swap
      const swapAmount = ethers.parseEther("10");
      await tokenA.transfer(await pair.getAddress(), swapAmount);
      
      const balanceBefore = await tokenB.balanceOf(user1.address);
      await pair.swap(0, ethers.parseEther("15"), user1.address, "0x");
      const balanceAfter = await tokenB.balanceOf(user1.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });
});

