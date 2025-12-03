import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("YieldFarm", function () {
  async function deployFixture() {
    const [owner, user1] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken");
    const stakingToken = await TestToken.deploy("Staking Token", "STK");
    await stakingToken.waitForDeployment();
    const rewardToken = await TestToken.deploy("Reward Token", "RWD");
    await rewardToken.waitForDeployment();

    const YieldFarm = await ethers.getContractFactory("YieldFarm");
    const yieldFarm = await YieldFarm.deploy(
      await stakingToken.getAddress(),
      await rewardToken.getAddress()
    );
    await yieldFarm.waitForDeployment();

    return { owner, user1, stakingToken, rewardToken, yieldFarm };
  }

  describe("Staking", function () {
    it("Should allow staking tokens", async function () {
      const { stakingToken, yieldFarm, user1 } = await loadFixture(deployFixture);
      
      const amount = ethers.parseEther("1000");
      await stakingToken.approve(await yieldFarm.getAddress(), amount);
      await yieldFarm.connect(user1).stake(amount);
      
      const stakedBalance = await yieldFarm.balanceOf(user1.address);
      expect(stakedBalance).to.equal(amount);
    });
  });

  describe("Rewards", function () {
    it("Should calculate earned rewards", async function () {
      const { stakingToken, rewardToken, yieldFarm, owner, user1 } = await loadFixture(deployFixture);
      
      // Stake tokens
      const stakeAmount = ethers.parseEther("1000");
      await stakingToken.approve(await yieldFarm.getAddress(), stakeAmount);
      await yieldFarm.connect(user1).stake(stakeAmount);
      
      // Add rewards
      const rewardAmount = ethers.parseEther("100");
      await rewardToken.approve(await yieldFarm.getAddress(), rewardAmount);
      await yieldFarm.connect(owner).notifyRewardAmount(rewardAmount);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine", []);
      
      const earned = await yieldFarm.earned(user1.address);
      expect(earned).to.be.gt(0);
    });
  });
});

