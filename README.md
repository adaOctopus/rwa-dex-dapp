# RWA DEX Project

A comprehensive full-stack DeFi/DEX application built with Next.js 15, Express.js, and Hardhat. This project implements a decentralized exchange with AMM (Automated Market Maker), lending, borrowing, and yield farming capabilities.

## Project Structure

```
rwa-dex-project/
├── frontend/          # Next.js 15 application with App Router
├── backend/           # Express.js off-chain indexer
├── contracts/         # Hardhat smart contracts project
└── README.md          # This file
```

## Features

### Frontend
- Modern Web3 UI with wallet connection (MetaMask, Coinbase Wallet)
- Sections: Upload, Mint, Trade, Swap, Yield
- Full TypeScript support
- Mobile responsive design

### Backend
- Express.js API server
- Off-chain indexer for blockchain events
- TypeScript support

### Smart Contracts
- **Factory**: Creates and manages pair/pool contracts
- **Pair/Pool**: AMM with constant product formula (x*y=k)
- **Router**: User-facing interface for swaps and liquidity operations
- **LP Token**: ERC-20 tokens representing liquidity pool shares
- **Oracle**: TWAP (Time-Weighted Average Price) for price feeds
- **Lending & Borrowing**: Interest rate models, collateralization, liquidation
- **Yield Farming**: Staking and yield generation mechanisms

## Quick Start

See the detailed guides:
- [Local Development & Deployment Guide](./docs/LOCAL_SETUP.md)
- [Smart Contract Integration Guide](./docs/INTEGRATION.md)

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, ethers.js, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Smart Contracts**: Solidity, Hardhat, Chai
- **Blockchain**: Ethereum (Local & Sepolia Testnet)

## Security Features

- ReentrancyGuard on all external calls
- SafeERC20 for token transfers
- Checks-Effects-Interactions pattern
- Slippage protection
- Access control (Ownable/RoleBased)
- Circuit breakers (Pausable)
- Input validation

## License

MIT

