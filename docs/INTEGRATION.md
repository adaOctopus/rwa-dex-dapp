# Smart Contract Integration Guide

This guide explains how the smart contracts are integrated with the frontend application, including which files handle which functionality.

## Architecture Overview

The application follows a three-tier architecture:

1. **Smart Contracts** (`contracts/contracts/`) - On-chain logic
2. **Frontend** (`frontend/`) - User interface and Web3 interactions
3. **Backend** (`backend/`) - Off-chain indexer and API

## Smart Contracts

### Core Contracts

#### 1. Factory (`contracts/contracts/Factory.sol`)
- **Purpose**: Creates and manages trading pairs
- **Key Functions**: `createPair()`, `getPair()`
- **Frontend Integration**: Used indirectly through Router

#### 2. Pair (`contracts/contracts/Pair.sol`)
- **Purpose**: AMM pool with constant product formula (x*y=k)
- **Key Functions**: `swap()`, `mint()`, `burn()`, `getReserves()`
- **Frontend Integration**: Used indirectly through Router

#### 3. Router (`contracts/contracts/Router.sol`)
- **Purpose**: User-facing interface for swaps and liquidity
- **Key Functions**: 
  - `swapExactTokensForTokens()`
  - `addLiquidity()`
  - `removeLiquidity()`
  - `getAmountsOut()`
- **Frontend Integration**: 
  - **File**: `frontend/components/SwapInterface.tsx`
  - **Usage**: Direct contract interaction for swaps

#### 4. Oracle (`contracts/contracts/Oracle.sol`)
- **Purpose**: TWAP price feeds
- **Key Functions**: `consult()`, `getPrice()`, `update()`
- **Frontend Integration**: Can be used for price display (not yet implemented)

#### 5. LendingPool (`contracts/contracts/LendingPool.sol`)
- **Purpose**: Lending and borrowing with collateral
- **Key Functions**: 
  - `mint()` - Supply assets
  - `borrow()` - Borrow assets
  - `repayBorrow()` - Repay borrowed amount
  - `redeem()` - Withdraw supplied assets
- **Frontend Integration**: 
  - **Files**: To be implemented in lending/borrowing pages
  - **Usage**: Direct contract interaction

#### 6. YieldFarm (`contracts/contracts/YieldFarm.sol`)
- **Purpose**: Staking and yield farming
- **Key Functions**: 
  - `stake()` - Stake tokens
  - `withdraw()` - Unstake tokens
  - `getReward()` - Claim rewards
  - `earned()` - View earned rewards
- **Frontend Integration**: 
  - **Files**: To be implemented in yield page
  - **Usage**: Direct contract interaction

## Frontend Integration

### Wallet Connection

**File**: `frontend/store/walletStore.ts`

This Zustand store manages wallet state:
- `connect()` - Connects to MetaMask/Web3 wallet
- `disconnect()` - Disconnects wallet
- `switchNetwork()` - Switches blockchain network
- Stores: `provider`, `signer`, `address`, `isConnected`

**Usage**:
```typescript
import { useWalletStore } from "@/store/walletStore";

const { signer, address, connect } = useWalletStore();
```

### Contract Interaction Pattern

All contract interactions follow this pattern:

1. **Get signer from wallet store**
2. **Load contract ABI and address**
3. **Create contract instance**
4. **Call contract function**
5. **Wait for transaction**

Example from `SwapInterface.tsx`:

```typescript
const { signer } = useWalletStore();
const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS;
const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
const tx = await router.swapExactTokensForTokens(...);
await tx.wait();
```

### Frontend Files Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page
│   ├── swap/page.tsx         # Swap page
│   ├── upload/page.tsx       # Upload page (placeholder)
│   ├── mint/page.tsx         # Mint page (placeholder)
│   ├── trade/page.tsx        # Trade page (placeholder)
│   └── yield/page.tsx        # Yield page (placeholder)
├── components/
│   ├── Navbar.tsx            # Navigation bar
│   ├── WalletConnect.tsx     # Wallet connection button
│   └── SwapInterface.tsx     # Swap functionality
└── store/
    └── walletStore.ts        # Wallet state management
```

### Contract ABIs

Contract ABIs are defined inline in components. For production, consider:

1. **Using TypeChain** (generated from contracts):
   ```bash
   cd contracts
   npx hardhat compile
   # ABIs will be in contracts/artifacts/
   ```

2. **Creating ABI files**:
   - Copy ABIs from `contracts/artifacts/contracts/*.sol/*.json`
   - Store in `frontend/abis/`
   - Import in components

Example structure:
```
frontend/
└── abis/
    ├── Router.json
    ├── Factory.json
    ├── LendingPool.json
    └── YieldFarm.json
```

## Integration Points

### 1. Swap Functionality

**Contract**: Router  
**Frontend**: `frontend/components/SwapInterface.tsx`  
**Page**: `frontend/app/swap/page.tsx`

**Flow**:
1. User enters token addresses and amounts
2. Frontend calls `router.getAmountsOut()` to get expected output
3. User confirms swap
4. Frontend calls `router.swapExactTokensForTokens()`
5. Transaction is sent and confirmed

**Key Functions Used**:
- `getAmountsOut()` - Calculate swap output
- `swapExactTokensForTokens()` - Execute swap

### 2. Liquidity (To Be Implemented)

**Contract**: Router  
**Frontend**: To be created  
**Page**: To be added

**Required Functions**:
- `addLiquidity()` - Add liquidity to pool
- `removeLiquidity()` - Remove liquidity from pool

### 3. Lending (To Be Implemented)

**Contract**: LendingPool  
**Frontend**: To be created  
**Page**: To be added

**Required Functions**:
- `mint()` - Supply assets
- `borrow()` - Borrow assets
- `repayBorrow()` - Repay loan
- `redeem()` - Withdraw supplied assets

### 4. Yield Farming (To Be Implemented)

**Contract**: YieldFarm  
**Frontend**: To be created  
**Page**: `frontend/app/yield/page.tsx` (placeholder)

**Required Functions**:
- `stake()` - Stake tokens
- `withdraw()` - Unstake tokens
- `getReward()` - Claim rewards
- `earned()` - View earned rewards

## Environment Variables

Contract addresses are loaded from environment variables:

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_ROUTER_ADDRESS=0x...
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...
NEXT_PUBLIC_YIELD_FARM_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=31337
```

**Usage in Code**:
```typescript
const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS;
```

## Backend Integration

**File**: `backend/src/index.ts`

The backend provides:
- Health checks
- Block number queries
- Balance queries
- Event indexing (placeholder)

**Future Enhancements**:
- Index contract events
- Store historical data
- Provide analytics API
- Cache price data

## Adding New Contract Interactions

To add a new contract interaction:

1. **Deploy contract** and get address
2. **Update environment variables** with contract address
3. **Create component** in `frontend/components/`
4. **Add ABI** (inline or from file)
5. **Implement interaction logic**:
   ```typescript
   const contract = new ethers.Contract(
     address,
     abi,
     signer
   );
   const tx = await contract.functionName(...args);
   await tx.wait();
   ```
6. **Add to page** in `frontend/app/`

## Best Practices

1. **Always check wallet connection** before contract calls
2. **Handle errors gracefully** with try-catch blocks
3. **Show loading states** during transactions
4. **Validate inputs** before sending transactions
5. **Use slippage protection** for swaps
6. **Check token approvals** before transfers
7. **Display transaction status** to users

## Testing Integration

1. **Local Testing**:
   - Deploy to local Hardhat node
   - Use test accounts from Hardhat
   - Test all interactions

2. **Sepolia Testing**:
   - Deploy to Sepolia testnet
   - Use testnet tokens
   - Verify on Etherscan

## Troubleshooting

### "Contract not deployed" error
- Check environment variables are set
- Verify contract address is correct
- Ensure network matches (local vs Sepolia)

### "Insufficient funds" error
- Check account balance
- Ensure enough ETH for gas
- For local: use Hardhat test accounts

### "Transaction reverted" error
- Check contract function requirements
- Verify token approvals
- Check slippage settings
- Review contract state

### "Network mismatch" error
- Ensure MetaMask is on correct network
- Check `NEXT_PUBLIC_CHAIN_ID` matches
- Use `switchNetwork()` function

## Next Steps

1. Implement remaining frontend pages (Liquidity, Lending, Yield)
2. Add contract ABIs to frontend
3. Implement error handling and loading states
4. Add transaction history
5. Integrate Oracle for price feeds
6. Add analytics and charts

