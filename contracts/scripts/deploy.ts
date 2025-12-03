import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy WETH
  console.log("\nDeploying WETH...");
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("WETH deployed to:", wethAddress);

  // Deploy Factory
  console.log("\nDeploying Factory...");
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("Factory deployed to:", factoryAddress);

  // Deploy Router
  console.log("\nDeploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(factoryAddress, wethAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("Router deployed to:", routerAddress);

  // Deploy Oracle
  console.log("\nDeploying Oracle...");
  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(factoryAddress);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("Oracle deployed to:", oracleAddress);

  // Deploy Test Tokens
  console.log("\nDeploying Test Tokens...");
  const TestToken = await ethers.getContractFactory("TestToken");
  const tokenA = await TestToken.deploy("Token A", "TKA");
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("Token A deployed to:", tokenAAddress);

  const tokenB = await TestToken.deploy("Token B", "TKB");
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("Token B deployed to:", tokenBAddress);

  // Deploy Lending Pool
  console.log("\nDeploying Lending Pool...");
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(tokenAAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("Lending Pool deployed to:", lendingPoolAddress);

  // Deploy Yield Farm
  console.log("\nDeploying Yield Farm...");
  const YieldFarm = await ethers.getContractFactory("YieldFarm");
  const yieldFarm = await YieldFarm.deploy(tokenAAddress, tokenBAddress);
  await yieldFarm.waitForDeployment();
  const yieldFarmAddress = await yieldFarm.getAddress();
  console.log("Yield Farm deployed to:", yieldFarmAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      WETH: wethAddress,
      Factory: factoryAddress,
      Router: routerAddress,
      Oracle: oracleAddress,
      TokenA: tokenAAddress,
      TokenB: tokenBAddress,
      LendingPool: lendingPoolAddress,
      YieldFarm: yieldFarmAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkName = network.name === "hardhat" ? "localhost" : network.name;
  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

