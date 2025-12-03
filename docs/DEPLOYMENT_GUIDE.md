# Contract Deployment Guide

This guide explains exactly which files and environment variables need to be updated after redeploying your smart contracts.

## After Contract Deployment

When you deploy contracts (locally or to Sepolia), the deployment script saves addresses to `contracts/deployments/<network>.json`. You **MUST** update the following files with the new contract addresses:

## Files to Update

### 1. Frontend Environment Variables

**File**: `frontend/.env.local`

Update these variables with the new contract addresses from the deployment output:

```env
# Required Contract Addresses
NEXT_PUBLIC_ROUTER_ADDRESS=0x...          # Router contract address
NEXT_PUBLIC_FACTORY_ADDRESS=0x...        # Factory contract address
NEXT_PUBLIC_ORACLE_ADDRESS=0x...         # Oracle contract address
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...   # LendingPool contract address
NEXT_PUBLIC_YIELD_FARM_ADDRESS=0x...     # YieldFarm contract address

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=31337               # 31337 for localhost, 11155111 for Sepolia
```

**Where to find addresses**: Check `contracts/deployments/<network>.json` after deployment:
- `contracts.Router` → `NEXT_PUBLIC_ROUTER_ADDRESS`
- `contracts.Factory` → `NEXT_PUBLIC_FACTORY_ADDRESS`
- `contracts.Oracle` → `NEXT_PUBLIC_ORACLE_ADDRESS`
- `contracts.LendingPool` → `NEXT_PUBLIC_LENDING_POOL_ADDRESS`
- `contracts.YieldFarm` → `NEXT_PUBLIC_YIELD_FARM_ADDRESS`

### 2. Backend Environment Variables

**File**: `backend/.env`

Update these variables with the new contract addresses:

```env
# Server Configuration
PORT=3001
RPC_URL=http://127.0.0.1:8545            # For localhost
# RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY  # For Sepolia

# Contract Addresses (Required for Event Indexing)
FACTORY_ADDRESS=0x...                    # Factory contract address
ROUTER_ADDRESS=0x...                     # Router contract address
ORACLE_ADDRESS=0x...                     # Oracle contract address
LENDING_POOL_ADDRESS=0x...               # LendingPool contract address
YIELD_FARM_ADDRESS=0x...                 # YieldFarm contract address
```

**Where to find addresses**: Same as frontend - from `contracts/deployments/<network>.json`

## Quick Update Script

After deployment, you can manually copy addresses from the deployment JSON file:

```bash
# View deployment addresses
cat contracts/deployments/localhost.json
# or
cat contracts/deployments/sepolia.json
```

## Step-by-Step Update Process

### For Local Development

1. **Deploy contracts**:
   ```bash
   cd contracts
   npm run deploy:local
   ```

2. **Copy addresses from deployment output** or from `contracts/deployments/localhost.json`

3. **Update `frontend/.env.local`**:
   ```env
   NEXT_PUBLIC_ROUTER_ADDRESS=<Router address from deployment>
   NEXT_PUBLIC_FACTORY_ADDRESS=<Factory address from deployment>
   NEXT_PUBLIC_ORACLE_ADDRESS=<Oracle address from deployment>
   NEXT_PUBLIC_LENDING_POOL_ADDRESS=<LendingPool address from deployment>
   NEXT_PUBLIC_YIELD_FARM_ADDRESS=<YieldFarm address from deployment>
   NEXT_PUBLIC_CHAIN_ID=31337
   ```

4. **Update `backend/.env`**:
   ```env
   PORT=3001
   RPC_URL=http://127.0.0.1:8545
   FACTORY_ADDRESS=<Factory address from deployment>
   ROUTER_ADDRESS=<Router address from deployment>
   ORACLE_ADDRESS=<Oracle address from deployment>
   LENDING_POOL_ADDRESS=<LendingPool address from deployment>
   YIELD_FARM_ADDRESS=<YieldFarm address from deployment>
   ```

5. **Restart servers**:
   ```bash
   # Restart backend
   cd backend
   npm run dev

   # Restart frontend (in another terminal)
   cd frontend
   npm run dev
   ```

### For Sepolia Testnet

1. **Deploy contracts**:
   ```bash
   cd contracts
   npm run deploy:sepolia
   ```

2. **Update `frontend/.env.local`**:
   ```env
   NEXT_PUBLIC_ROUTER_ADDRESS=<Router address>
   NEXT_PUBLIC_FACTORY_ADDRESS=<Factory address>
   NEXT_PUBLIC_ORACLE_ADDRESS=<Oracle address>
   NEXT_PUBLIC_LENDING_POOL_ADDRESS=<LendingPool address>
   NEXT_PUBLIC_YIELD_FARM_ADDRESS=<YieldFarm address>
   NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia chain ID
   ```

3. **Update `backend/.env`**:
   ```env
   PORT=3001
   RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   FACTORY_ADDRESS=<Factory address>
   ROUTER_ADDRESS=<Router address>
   ORACLE_ADDRESS=<Oracle address>
   LENDING_POOL_ADDRESS=<LendingPool address>
   YIELD_FARM_ADDRESS=<YieldFarm address>
   ```

4. **Restart servers**

## Deployment JSON Structure

The deployment script creates a JSON file with this structure:

```json
{
  "network": "localhost",
  "chainId": 31337,
  "deployer": "0x...",
  "contracts": {
    "WETH": "0x...",
    "Factory": "0x...",
    "Router": "0x...",
    "Oracle": "0x...",
    "TokenA": "0x...",
    "TokenB": "0x...",
    "LendingPool": "0x...",
    "YieldFarm": "0x..."
  },
  "timestamp": "2024-..."
}
```

## Verification Checklist

After updating environment variables, verify:

- [ ] All contract addresses are set in `frontend/.env.local`
- [ ] All contract addresses are set in `backend/.env`
- [ ] `NEXT_PUBLIC_CHAIN_ID` matches your network (31337 for local, 11155111 for Sepolia)
- [ ] `RPC_URL` in backend matches your network
- [ ] Frontend and backend servers have been restarted
- [ ] Wallet is connected to the correct network

## Testing After Update

1. **Frontend**: Open the app and verify wallet connection works
2. **Swap Page**: Try a swap (if you have test tokens)
3. **Backend**: Check `/health` endpoint
4. **Events**: Check `/indexer/status` to verify event indexing started

## Common Issues

### "Contract not deployed" error
- **Cause**: Environment variables not updated or incorrect addresses
- **Fix**: Verify all addresses in both `.env` files match deployment output

### "Network mismatch" error
- **Cause**: `NEXT_PUBLIC_CHAIN_ID` doesn't match connected network
- **Fix**: Update `NEXT_PUBLIC_CHAIN_ID` to match your network (31337 or 11155111)

### Events not indexing
- **Cause**: Contract addresses not set in `backend/.env`
- **Fix**: Ensure all contract addresses are set in `backend/.env` and restart backend

### Frontend can't connect to contracts
- **Cause**: Missing or incorrect `NEXT_PUBLIC_*_ADDRESS` variables
- **Fix**: Verify all frontend environment variables are set correctly

## Important Notes

1. **Always restart servers** after updating environment variables
2. **Frontend requires rebuild** if environment variables change in production
3. **Backend event indexing** starts automatically when addresses are configured
4. **Test tokens** (TokenA, TokenB) addresses are also in deployment JSON if needed

## Summary

**After every contract deployment, update:**

1. ✅ `frontend/.env.local` - All `NEXT_PUBLIC_*_ADDRESS` variables
2. ✅ `backend/.env` - All contract address variables
3. ✅ Restart both frontend and backend servers
4. ✅ Verify connection in browser

That's it! These are the only files that need updating after redeployment.

