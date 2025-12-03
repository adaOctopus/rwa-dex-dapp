import express, { Request, Response } from "express";
import cors from "cors";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize provider
const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL || "http://127.0.0.1:8545"
);

// Event storage (in-memory, can be extended to database)
interface IndexedEvent {
  contract: string;
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  args: any;
  timestamp: number;
}

const eventStore: Map<string, IndexedEvent[]> = new Map();
let lastIndexedBlock: number = 0;

// Contract addresses from environment
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";
const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS || "";
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || "";
const LENDING_POOL_ADDRESS = process.env.LENDING_POOL_ADDRESS || "";
const YIELD_FARM_ADDRESS = process.env.YIELD_FARM_ADDRESS || "";

// Common event signatures
const SWAP_EVENT = "Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)";
const MINT_EVENT = "Mint(address indexed sender, uint256 amount0, uint256 amount1)";
const BURN_EVENT = "Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)";
const TRANSFER_EVENT = "Transfer(address indexed from, address indexed to, uint256 value)";

// Start indexing events
async function startEventIndexing() {
  try {
    const currentBlock = await provider.getBlockNumber();
    lastIndexedBlock = currentBlock - 1000; // Index last 1000 blocks initially
    
    console.log(`Starting event indexing from block ${lastIndexedBlock}`);
    
    // Index events periodically
    setInterval(async () => {
      await indexEvents();
    }, 30000); // Every 30 seconds
    
    // Initial index
    await indexEvents();
  } catch (error) {
    console.error("Error starting event indexing:", error);
  }
}

async function indexEvents() {
  try {
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = lastIndexedBlock + 1;
    const toBlock = Math.min(currentBlock, fromBlock + 100); // Index 100 blocks at a time
    
    if (fromBlock > toBlock) return;
    
    console.log(`Indexing events from block ${fromBlock} to ${toBlock}`);
    
    // Index Factory events
    if (FACTORY_ADDRESS) {
      await indexContractEvents(FACTORY_ADDRESS, "Factory", fromBlock, toBlock);
    }
    
    // Index Router events (Router uses Pair events indirectly)
    if (ROUTER_ADDRESS) {
      await indexContractEvents(ROUTER_ADDRESS, "Router", fromBlock, toBlock);
    }
    
    // Index Lending Pool events
    if (LENDING_POOL_ADDRESS) {
      await indexContractEvents(LENDING_POOL_ADDRESS, "LendingPool", fromBlock, toBlock);
    }
    
    // Index Yield Farm events
    if (YIELD_FARM_ADDRESS) {
      await indexContractEvents(YIELD_FARM_ADDRESS, "YieldFarm", fromBlock, toBlock);
    }
    
    lastIndexedBlock = toBlock;
  } catch (error) {
    console.error("Error indexing events:", error);
  }
}

async function indexContractEvents(
  contractAddress: string,
  contractName: string,
  fromBlock: number,
  toBlock: number
) {
  try {
    // Get all Transfer events
    const transferFilter = {
      address: contractAddress,
      topics: [ethers.id(TRANSFER_EVENT)],
    };
    
    const transferLogs = await provider.getLogs({
      ...transferFilter,
      fromBlock,
      toBlock,
    });
    
    for (const log of transferLogs) {
      const event: IndexedEvent = {
        contract: contractAddress,
        eventName: "Transfer",
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        args: log.topics,
        timestamp: Date.now(),
      };
      
      if (!eventStore.has(contractAddress)) {
        eventStore.set(contractAddress, []);
      }
      eventStore.get(contractAddress)!.push(event);
    }
    
    // Get other events based on contract type
    if (contractName === "LendingPool") {
      const mintFilter = { address: contractAddress, topics: [ethers.id("Mint(address,uint256,uint256)")] };
      const borrowFilter = { address: contractAddress, topics: [ethers.id("Borrow(address,uint256)")] };
      
      const [mintLogs, borrowLogs] = await Promise.all([
        provider.getLogs({ ...mintFilter, fromBlock, toBlock }),
        provider.getLogs({ ...borrowFilter, fromBlock, toBlock }),
      ]);
      
      for (const log of [...mintLogs, ...borrowLogs]) {
        const event: IndexedEvent = {
          contract: contractAddress,
          eventName: log.topics[0] === ethers.id("Mint(address,uint256,uint256)") ? "Mint" : "Borrow",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          args: log.topics,
          timestamp: Date.now(),
        };
        
        if (!eventStore.has(contractAddress)) {
          eventStore.set(contractAddress, []);
        }
        eventStore.get(contractAddress)!.push(event);
      }
    }
    
    if (contractName === "YieldFarm") {
      const stakeFilter = { address: contractAddress, topics: [ethers.id("Staked(address,uint256)")] };
      const rewardFilter = { address: contractAddress, topics: [ethers.id("RewardPaid(address,uint256)")] };
      
      const [stakeLogs, rewardLogs] = await Promise.all([
        provider.getLogs({ ...stakeFilter, fromBlock, toBlock }),
        provider.getLogs({ ...rewardFilter, fromBlock, toBlock }),
      ]);
      
      for (const log of [...stakeLogs, ...rewardLogs]) {
        const event: IndexedEvent = {
          contract: contractAddress,
          eventName: log.topics[0] === ethers.id("Staked(address,uint256)") ? "Staked" : "RewardPaid",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          args: log.topics,
          timestamp: Date.now(),
        };
        
        if (!eventStore.has(contractAddress)) {
          eventStore.set(contractAddress, []);
        }
        eventStore.get(contractAddress)!.push(event);
      }
    }
  } catch (error) {
    console.error(`Error indexing ${contractName} events:`, error);
  }
}

// Routes
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get block number
app.get("/block", async (req: Request, res: Response) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    res.json({ blockNumber });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get account balance
app.get("/balance/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const balance = await provider.getBalance(address);
    res.json({ address, balance: balance.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get indexed events for a contract
app.get("/events/:contract", async (req: Request, res: Response) => {
  try {
    const { contract } = req.params;
    const { eventName, limit = "100" } = req.query;
    
    let events = eventStore.get(contract.toLowerCase()) || [];
    
    if (eventName) {
      events = events.filter((e) => e.eventName === eventName);
    }
    
    // Sort by block number (newest first) and limit
    events = events
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, parseInt(limit as string));
    
    res.json({
      contract,
      eventCount: events.length,
      events,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all indexed events
app.get("/events", async (req: Request, res: Response) => {
  try {
    const allEvents: { contract: string; events: IndexedEvent[] }[] = [];
    
    eventStore.forEach((events, contract) => {
      allEvents.push({
        contract,
        events: events.sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 50),
      });
    });
    
    res.json({
      totalContracts: allEvents.length,
      events: allEvents,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get indexing status
app.get("/indexer/status", (req: Request, res: Response) => {
  res.json({
    lastIndexedBlock,
    indexedContracts: Array.from(eventStore.keys()),
    totalEvents: Array.from(eventStore.values()).reduce((sum, events) => sum + events.length, 0),
  });
});

app.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Connected to RPC: ${process.env.RPC_URL || "http://127.0.0.1:8545"}`);
  
  // Start event indexing
  await startEventIndexing();
});

