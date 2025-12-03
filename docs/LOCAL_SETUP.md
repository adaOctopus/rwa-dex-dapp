# Local Development & Deployment Guide

This guide will walk you through setting up and running the RWA DEX project locally and on Sepolia testnet.

## Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or another Web3 wallet
- For Sepolia: Sepolia ETH for gas fees

## Project Structure

```
rwa-dex-project/
├── contracts/     # Hardhat smart contracts
├── frontend/      # Next.js 15 application
├── backend/       # Express.js indexer
└── docs/          # Documentation
```

## Step 1: Install Dependencies

From the project root:

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Step 2: Configure Environment Variables

### Contracts Configuration

Create `contracts/.env` file:

```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env`:

```env
# For Sepolia deployment
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Frontend Configuration

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_ROUTER_ADDRESS=
NEXT_PUBLIC_FACTORY_ADDRESS=
NEXT_PUBLIC_ORACLE_ADDRESS=
NEXT_PUBLIC_LENDING_POOL_ADDRESS=
NEXT_PUBLIC_YIELD_FARM_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=31337
```

### Backend Configuration

Create `backend/.env`:

```env
PORT=3001
RPC_URL=http://127.0.0.1:8545
FACTORY_ADDRESS=
ROUTER_ADDRESS=
ORACLE_ADDRESS=
```

## Step 3: Local Development

### 3.1 Start Local Hardhat Node

In a new terminal:

```bash
cd contracts
npm run node
```

This starts a local Hardhat node on `http://127.0.0.1:8545` with 20 test accounts.

### 3.2 Deploy Contracts to Local Network

In a new terminal:

```bash
cd contracts
npm run deploy:local
```

This will:
- Deploy all contracts (WETH, Factory, Router, Oracle, Test Tokens, Lending Pool, Yield Farm)
- Save deployment addresses to `contracts/deployments/localhost.json`

**Important**: Copy the contract addresses from the deployment output and update:
- `frontend/.env.local`
- `backend/.env`

### 3.3 Run Tests

```bash
cd contracts
npm test
```

This runs all unit tests with Chai.

### 3.4 Start Backend Server

In a new terminal:

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`.

### 3.5 Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`.

## Step 4: Sepolia Testnet Deployment

### 4.1 Configure Sepolia Network

1. Ensure your `contracts/.env` has Sepolia configuration
2. Fund your deployer account with Sepolia ETH

### 4.2 Deploy to Sepolia

```bash
cd contracts
npm run deploy:sepolia
```

This will:
- Deploy all contracts to Sepolia
- Save deployment addresses to `contracts/deployments/sepolia.json`

### 4.3 Update Configuration Files

Update the following with Sepolia contract addresses:
- `frontend/.env.local` (set `NEXT_PUBLIC_CHAIN_ID=11155111`)
- `backend/.env` (set `RPC_URL` to Sepolia RPC)

### 4.4 Verify Contracts (Optional)

If you have Etherscan API key configured:

```bash
cd contracts
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Step 5: Testing

### Run Contract Tests

```bash
cd contracts
npm test
```

### Test Frontend

1. Open `http://localhost:3000`
2. Connect your MetaMask wallet
3. Switch to local network (Chain ID: 31337) or Sepolia (Chain ID: 11155111)
4. Test wallet connection and navigation

### Test Backend

```bash
# Health check
curl http://localhost:3001/health

# Get block number
curl http://localhost:3001/block

# Get balance
curl http://localhost:3001/balance/0x...
```

## Step 6: Switching Between Networks

### Switch to Local Network

1. Update `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_CHAIN_ID=31337
   ```

2. Update `backend/.env`:
   ```env
   RPC_URL=http://127.0.0.1:8545
   ```

3. Restart frontend and backend servers

4. In MetaMask, switch to Localhost 8545 network

### Switch to Sepolia

1. Update `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

2. Update `backend/.env`:
   ```env
   RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   ```

3. Update contract addresses in both files

4. Restart servers

5. In MetaMask, switch to Sepolia network

## Troubleshooting

### Contracts won't compile

```bash
cd contracts
npx hardhat clean
npm install
npx hardhat compile
```

### Frontend build errors

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend connection errors

- Verify RPC URL is correct
- Check if Hardhat node is running (for local)
- Verify network connectivity (for Sepolia)

### MetaMask connection issues

- Ensure MetaMask is unlocked
- Check if correct network is selected
- Clear browser cache and reload

## File Updates After Deployment

After deploying contracts, you need to update:

1. **Frontend** (`frontend/.env.local`):
   - All `NEXT_PUBLIC_*_ADDRESS` variables
   - `NEXT_PUBLIC_CHAIN_ID`

2. **Backend** (`backend/.env`):
   - Contract addresses
   - `RPC_URL`

3. **Deployment Info**:
   - Check `contracts/deployments/<network>.json` for all addresses

## Next Steps

- See [INTEGRATION.md](./INTEGRATION.md) for smart contract integration details
- Explore the frontend pages: Upload, Mint, Trade, Swap, Yield
- Test contract interactions through the UI

