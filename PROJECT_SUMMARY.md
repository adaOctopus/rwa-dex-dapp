# RWA DEX Project - Project Summary

## Overview

The RWA DEX (Real World Assets Decentralized Exchange) is a comprehensive full-stack DeFi application that implements a decentralized exchange with Automated Market Maker (AMM) functionality, lending, borrowing, and yield farming capabilities. Built with modern web technologies and deployed on Ethereum-compatible networks.

## Project Purpose

This project aims to provide a complete DeFi platform where users can:
- Trade tokens through an AMM-based decentralized exchange
- Provide liquidity to trading pairs and earn fees
- Lend and borrow assets with collateralization
- Stake tokens and participate in yield farming
- Interact with all features through a modern, responsive web interface

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3 Library**: ethers.js v6.9.0
- **State Management**: Zustand v4.5.0
- **Wallet Support**: MetaMask, Coinbase Wallet, and other Web3 wallets

### Backend
- **Framework**: Express.js v4.18.2
- **Language**: TypeScript
- **Blockchain Interaction**: ethers.js v6.9.0
- **Runtime**: Node.js 18+
- **Purpose**: Off-chain indexer and API server for blockchain events and data

### Smart Contracts
- **Language**: Solidity ^0.8.20
- **Development Framework**: Hardhat v2.19.0
- **Testing**: Chai
- **Security Libraries**: OpenZeppelin Contracts v5.0.0
- **Type Generation**: TypeChain
- **Blockchain**: Ethereum (Local Hardhat Network & Sepolia Testnet)

## Project Structure

```
rwa-dex-project/
├── frontend/              # Next.js 15 application with App Router
│   ├── app/              # App Router pages
│   │   ├── page.tsx      # Home page
│   │   ├── swap/         # Swap page
│   │   ├── upload/       # Upload page (placeholder)
│   │   ├── mint/         # Mint page (placeholder)
│   │   ├── trade/        # Trade page (placeholder)
│   │   └── yield/        # Yield farming page (placeholder)
│   ├── components/       # React components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   ├── WalletConnect.tsx  # Wallet connection component
│   │   ├── SwapInterface.tsx  # Swap functionality component
│   │   ├── LiquidityInterface.tsx  # Liquidity management component
│   │   └── OraclePrice.tsx  # Oracle price feed component
│   ├── store/           # State management
│   │   └── walletStore.ts # Wallet state (Zustand)
│   └── package.json
│
├── backend/              # Express.js off-chain indexer
│   ├── src/
│   │   └── index.ts      # Main server file
│   └── package.json
│
├── contracts/            # Hardhat smart contracts project
│   ├── contracts/        # Solidity contracts
│   │   ├── Factory.sol   # Pair factory contract
│   │   ├── Pair.sol      # AMM pair/pool contract
│   │   ├── Router.sol    # Router for swaps and liquidity
│   │   ├── Oracle.sol    # TWAP price oracle
│   │   ├── LendingPool.sol  # Lending and borrowing pool
│   │   ├── YieldFarm.sol    # Yield farming contract
│   │   ├── ERC20.sol     # ERC-20 token implementation
│   │   ├── WETH.sol      # Wrapped ETH contract
│   │   ├── TestToken.sol # Test token for development
│   │   ├── interfaces/   # Contract interfaces
│   │   └── libraries/    # Solidity libraries
│   ├── scripts/          # Deployment scripts
│   │   └── deploy.ts     # Main deployment script
│   ├── test/             # Contract tests
│   └── package.json
│
├── docs/                 # Documentation
│   ├── LOCAL_SETUP.md    # Local development guide
│   ├── INTEGRATION.md    # Smart contract integration guide
│   └── DEPLOYMENT_GUIDE.md  # Contract deployment and environment variable update guide
│
├── package.json          # Root package.json with workspace scripts
├── README.md             # Main project README
└── install.sh            # Installation script
```

## Core Features

### 1. Decentralized Exchange (DEX)

#### Automated Market Maker (AMM)
- **Constant Product Formula**: Uses x*y=k formula for price determination
- **Factory Contract**: Creates and manages trading pairs
- **Pair Contract**: Handles liquidity pools and swaps
- **Router Contract**: User-friendly interface for swaps and liquidity operations
- **LP Tokens**: ERC-20 tokens representing liquidity provider shares

#### Swap Functionality
- Token-to-token swaps
- Slippage protection
- Price calculation via Router
- Real-time price quotes

### 2. Lending & Borrowing

#### LendingPool Contract
- **Supply Assets**: Users can supply assets to earn interest
- **Borrow Assets**: Users can borrow against collateral
- **Interest Rate Model**: Dynamic interest rates based on utilization
- **Collateralization**: 75% collateral factor
- **Liquidation**: Automatic liquidation at 80% threshold
- **cToken Pattern**: Similar to Compound's cToken model
- **Reserve Factor**: 10% of interest goes to reserves

### 3. Yield Farming

#### YieldFarm Contract
- **Staking**: Stake tokens to earn rewards
- **Reward Distribution**: Automated reward calculation and distribution
- **Withdrawal**: Unstake tokens and claim rewards
- **Reward Tracking**: View earned rewards in real-time

### 4. Price Oracle

#### Oracle Contract
- **TWAP (Time-Weighted Average Price)**: Provides price feeds
- **Price Updates**: Regular price updates from AMM pairs
- **Price Consultation**: Query historical and current prices

### 5. Frontend Features

#### User Interface
- **Wallet Connection**: Support for MetaMask and Coinbase Wallet
- **Network Switching**: Automatic network detection and switching
- **Mobile Responsive**: Fully responsive design for all devices
- **Modern UI**: Gradient backgrounds, glassmorphism effects, smooth animations

#### Pages
- **Home**: Welcome page with wallet connection
- **Swap**: Token swap interface with slippage protection
- **Upload**: Asset upload page with file upload and metadata management
- **Mint**: Token minting page for minting TestToken ERC20 tokens
- **Trade**: Liquidity management page with add/remove liquidity and price oracle
- **Yield**: Yield farming page with staking, withdrawal, reward claiming, and exit functionality

### 6. Backend API

#### Endpoints
- `GET /health` - Health check endpoint
- `GET /block` - Get current block number
- `GET /balance/:address` - Get account balance
- `GET /events/:contract` - Get indexed events for a specific contract (with optional eventName and limit filters)
- `GET /events` - Get all indexed events across all contracts
- `GET /indexer/status` - Get event indexing status and statistics

## Smart Contracts Architecture

### Core Contracts

1. **Factory.sol**
   - Creates trading pairs
   - Manages pair registry
   - Fee configuration
   - Ownable pattern for access control

2. **Pair.sol**
   - AMM pool implementation
   - Constant product formula (x*y=k)
   - Liquidity provision and removal
   - Token swaps
   - Reserve management

3. **Router.sol**
   - User-facing swap interface
   - Liquidity management
   - Price calculations
   - Slippage protection
   - Multi-hop routing support

4. **Oracle.sol**
   - TWAP price calculation
   - Price feed updates
   - Historical price queries
   - Integration with Pair contracts

5. **LendingPool.sol**
   - Asset supply and withdrawal
   - Borrowing with collateral
   - Interest rate calculation
   - Liquidation mechanism
   - Reserve management

6. **YieldFarm.sol**
   - Token staking
   - Reward distribution
   - Staking period management
   - Reward claiming

### Supporting Contracts

- **ERC20.sol**: Standard ERC-20 token implementation
- **WETH.sol**: Wrapped ETH for native token handling
- **TestToken.sol**: Test tokens for development and testing

## Security Features

### Smart Contract Security
- **ReentrancyGuard**: Protection against reentrancy attacks on all external calls
- **SafeERC20**: Safe token transfer patterns
- **Checks-Effects-Interactions**: Proper state management pattern
- **Slippage Protection**: Built-in slippage checks for swaps
- **Access Control**: Ownable and role-based access control
- **Circuit Breakers**: Pausable contracts for emergency stops
- **Input Validation**: Comprehensive input validation on all functions

### Frontend Security
- **Wallet Connection Validation**: Proper wallet and network validation
- **Transaction Confirmation**: User confirmation before transactions
- **Error Handling**: Comprehensive error handling and user feedback

## Development Workflow

### Local Development
1. Start Hardhat local node
2. Deploy contracts to local network
3. Update environment variables with contract addresses
4. Start backend server
5. Start frontend development server
6. Connect MetaMask to local network

### Testing
- **Contract Tests**: Comprehensive unit tests using Chai
- **Integration Tests**: End-to-end testing of contract interactions
- **Frontend Testing**: Manual testing through UI

### Deployment
- **Local Network**: Hardhat node for development
- **Sepolia Testnet**: Public testnet deployment
- **Contract Verification**: Optional Etherscan verification

## Environment Configuration

### Frontend (.env.local)
```env
NEXT_PUBLIC_ROUTER_ADDRESS=
NEXT_PUBLIC_FACTORY_ADDRESS=
NEXT_PUBLIC_ORACLE_ADDRESS=
NEXT_PUBLIC_LENDING_POOL_ADDRESS=
NEXT_PUBLIC_YIELD_FARM_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=31337
```

### Backend (.env)
```env
PORT=3001
RPC_URL=http://127.0.0.1:8545
FACTORY_ADDRESS=
ROUTER_ADDRESS=
ORACLE_ADDRESS=
```

### Contracts (.env)
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Key Scripts

### Root Level
- `npm run dev` - Run frontend and backend concurrently
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only
- `npm run build:frontend` - Build frontend for production
- `npm run build:backend` - Build backend for production
- `npm run test:contracts` - Run contract tests
- `npm run deploy:local` - Deploy contracts to local network
- `npm run deploy:sepolia` - Deploy contracts to Sepolia testnet
- `npm run node` - Start Hardhat local node

## Current Implementation Status

### ✅ Implemented
- Smart contract architecture (Factory, Pair, Router, Oracle, LendingPool, YieldFarm)
- Frontend wallet connection (MetaMask, Coinbase Wallet)
- Swap interface and functionality
- Upload page with file upload interface
- Mint page with token minting functionality
- Trade page with liquidity management (add/remove liquidity)
- Yield farming page with full staking interface (stake, withdraw, claim rewards, exit)
- Backend API server with basic endpoints
- Backend event indexing system (indexes Transfer, Mint, Borrow, Staked, RewardPaid events)
- Oracle price feed integration in frontend
- Liquidity management UI component
- Contract deployment scripts
- Local development setup
- Documentation (README, LOCAL_SETUP, INTEGRATION, DEPLOYMENT_GUIDE)

## Future Enhancements

### Smart Contracts
- Multi-token pools support
- Advanced AMM formulas (StableSwap, etc.)
- Flash loan functionality
- Governance token and DAO
- Multi-chain support

### Frontend
- Transaction history
- Analytics and charts
- Portfolio tracking
- Advanced swap routing
- Lending/borrowing interface (UI for LendingPool interactions)
- Enhanced error handling and user feedback

### Backend
- Database integration for persistent event storage (currently in-memory)
- Historical data API
- Price analytics
- Transaction monitoring
- User activity tracking
- Caching layer for performance

## Dependencies

### Frontend Dependencies
- next: ^15.0.0
- react: ^18.3.1
- react-dom: ^18.3.1
- ethers: ^6.9.0
- zustand: ^4.5.0
- tailwindcss: ^3.4.1

### Backend Dependencies
- express: ^4.18.2
- ethers: ^6.9.0
- cors: ^2.8.5
- dotenv: ^16.3.1

### Contract Dependencies
- @openzeppelin/contracts: ^5.0.0
- hardhat: ^2.19.0
- @nomicfoundation/hardhat-toolbox: ^4.0.0
- chai: ^4.3.10

## License

MIT License

## Project Status

**Version**: 1.0.0  
**Status**: Active Development  
**Network Support**: Ethereum (Local & Sepolia Testnet)  
**Last Updated**: 2024

---

## Contract Deployment

After redeploying contracts, you must update environment variables. See the [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions on which files to update.

**Quick Summary**: Update contract addresses in:
- `frontend/.env.local` - All `NEXT_PUBLIC_*_ADDRESS` variables
- `backend/.env` - All contract address variables

## Quick Links

- [Main README](./README.md)
- [Local Setup Guide](./docs/LOCAL_SETUP.md)
- [Integration Guide](./docs/INTEGRATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

