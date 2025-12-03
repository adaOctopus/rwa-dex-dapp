import { create } from "zustand";
import { ethers } from "ethers";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  
  connect: async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      set({
        isConnected: true,
        address,
        provider,
        signer,
      });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          set({ isConnected: false, address: null, provider: null, signer: null });
        } else {
          set({ address: accounts[0] });
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
    });
  },

  switchNetwork: async (chainId: number) => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, try to add it
        const chainConfig = getChainConfig(chainId);
        if (chainConfig) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [chainConfig],
          });
        }
      }
    }
  },
}));

function getChainConfig(chainId: number) {
  if (chainId === 11155111) {
    // Sepolia
    return {
      chainId: `0x${chainId.toString(16)}`,
      chainName: "Sepolia",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://sepolia.infura.io/v3/"],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    };
  } else if (chainId === 31337) {
    // Localhost
    return {
      chainId: `0x${chainId.toString(16)}`,
      chainName: "Localhost",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: ["http://127.0.0.1:8545"],
    };
  }
  return null;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

