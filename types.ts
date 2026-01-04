export interface User {
  username: string;
  email: string;
  password: string; // In a real app, this would be hashed
  secretKey: string;
  totalAssets: number;
  monthlyYield: number;
  transactions: Transaction[]; // Added transaction history
  avatar?: string; // Optional custom avatar (Base64 data URL)
}

export interface Crypto {
  symbol: string;
  name: string;
  price: number;
  secondaryPrice?: string;
  change: number; // Percentage
  isPositive: boolean;
  isHot?: boolean;
  logoUrl: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  apy: number;
  minDeposit: number;
  risk: 'Low' | 'Medium' | 'High';
  term?: string;      // e.g., 'Flexible', '30 Days', 'Locked'
  category?: string;  // e.g., 'Staking', 'DeFi', 'Saver'
  poolFilled?: number; // Percentage 0-100
}

export interface Transaction {
  id: string;
  type: 'Buy' | 'Sell' | 'Receive' | 'Send' | 'P2P Sent' | 'P2P Received';
  amount: number;
  asset: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  details?: string; // For address or username
}

export type NavTab = 'home' | 'invest' | 'trade' | 'profile';