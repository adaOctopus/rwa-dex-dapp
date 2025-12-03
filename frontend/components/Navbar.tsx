"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/upload", label: "Upload" },
    { href: "/mint", label: "Mint" },
    { href: "/trade", label: "Trade" },
    { href: "/swap", label: "Swap" },
    { href: "/yield", label: "Yield" },
  ];

  return (
    <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-white">
              RWA DEX
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}

