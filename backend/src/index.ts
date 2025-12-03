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

// Indexer endpoint (placeholder for future event indexing)
app.get("/events/:contract", async (req: Request, res: Response) => {
  try {
    const { contract } = req.params;
    // In production, this would query indexed events from a database
    res.json({ contract, events: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Connected to RPC: ${process.env.RPC_URL || "http://127.0.0.1:8545"}`);
});

