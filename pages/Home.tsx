import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, 
  HelpCircle, TrendingUp, TrendingDown, Crown, Headphones, 
  Monitor, Globe, 
  Zap, ArrowUp, Flame, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Search, Activity,
  Trophy, Medal, Star, BarChart3, Coins, PieChart, ArrowRight, ArrowLeft
} from 'lucide-react';
import { User, NavTab } from '../types';

interface HomeProps {
  user: User;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onNavigate: (tab: NavTab) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

interface MarketCoin {
  symbol: string;
  name: string;
  price: number;
  fiat: number;
  change: number;
  isHot: boolean;
  logo: string;
  decimals: number;
  flash: 'green' | 'red' | null;
  chart: number[];
  volume: string;
  tag: string;
  marketCap: string;
  supply: string;
  dominance: string;
}

// Helper to generate mock chart data
const genChart = () => Array.from({ length: 25 }, () => 100 + Math.random() * 50 - 25);

const INITIAL_MARKET_DATA: MarketCoin[] = [
  { symbol: 'BNB', name: 'BNB', price: 861.78, fiat: 105481.87, change: 1.06, isHot: true, logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '1.2B', tag: 'L1', marketCap: '130B', supply: '153M', dominance: '3.5%' },
  { symbol: 'BTC', name: 'Bitcoin', price: 88397.50, fiat: 10819854.00, change: 1.30, isHot: true, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '45.8B', tag: 'PoW', marketCap: '1.7T', supply: '19.6M', dominance: '52.1%' },
  { symbol: 'ETH', name: 'Ethereum', price: 2974.97, fiat: 364136.33, change: 1.16, isHot: true, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '18.5B', tag: 'L1', marketCap: '350B', supply: '120M', dominance: '17.2%' },
  { symbol: 'SOL', name: 'Solana', price: 125.50, fiat: 15361.20, change: 1.58, isHot: false, logo: 'https://cryptologos.cc/logos/solana-sol-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '3.2B', tag: 'L1', marketCap: '56B', supply: '443M', dominance: '2.1%' },
  { symbol: 'XRP', name: 'Ripple', price: 1.8693, fiat: 228.80, change: 0.55, isHot: false, logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png', decimals: 4, flash: null, chart: genChart(), volume: '1.5B', tag: 'Pay', marketCap: '101B', supply: '54B', dominance: '3.8%' },
  { symbol: 'ADA', name: 'Cardano', price: 0.3542, fiat: 43.35, change: -0.85, isHot: false, logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png', decimals: 4, flash: null, chart: genChart(), volume: '450M', tag: 'L1', marketCap: '12B', supply: '35B', dominance: '0.8%' },
  { symbol: 'AVAX', name: 'Avalanche', price: 25.40, fiat: 3108.96, change: 2.15, isHot: false, logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '280M', tag: 'L1', marketCap: '9B', supply: '377M', dominance: '0.5%' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.12313, fiat: 15.07, change: -0.14, isHot: false, logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png', decimals: 5, flash: null, chart: genChart(), volume: '890M', tag: 'Meme', marketCap: '17B', supply: '143B', dominance: '0.9%' },
  { symbol: 'DOT', name: 'Polkadot', price: 4.52, fiat: 553.24, change: 0.92, isHot: false, logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '150M', tag: 'L0', marketCap: '6B', supply: '1.4B', dominance: '0.3%' },
  { symbol: 'TRX', name: 'Tron', price: 0.2857, fiat: 34.97, change: 0.07, isHot: false, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png', decimals: 4, flash: null, chart: genChart(), volume: '320M', tag: 'L1', marketCap: '25B', supply: '87B', dominance: '1.1%' },
  { symbol: 'LINK', name: 'Chainlink', price: 10.50, fiat: 1285.20, change: 1.45, isHot: false, logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '180M', tag: 'Oracle', marketCap: '6B', supply: '587M', dominance: '0.3%' },
  { symbol: 'MATIC', name: 'Polygon', price: 0.4021, fiat: 49.21, change: -1.20, isHot: false, logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png', decimals: 4, flash: null, chart: genChart(), volume: '210M', tag: 'L2', marketCap: '4B', supply: '9.3B', dominance: '0.2%' },
  { symbol: 'SHIB', name: 'Shiba Inu', price: 0.00001745, fiat: 0.002135, change: 3.50, isHot: false, logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png', decimals: 8, flash: null, chart: genChart(), volume: '600M', tag: 'Meme', marketCap: '10B', supply: '589T', dominance: '0.6%' },
  { symbol: 'LTC', name: 'Litecoin', price: 70.15, fiat: 8586.36, change: 0.45, isHot: false, logo: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '400M', tag: 'PoW', marketCap: '5B', supply: '74M', dominance: '0.3%' },
  { symbol: 'UNI', name: 'Uniswap', price: 7.55, fiat: 924.12, change: -0.55, isHot: false, logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '120M', tag: 'DeFi', marketCap: '4.5B', supply: '598M', dominance: '0.2%' },
  { symbol: 'PEPE', name: 'Pepe', price: 0.00000411, fiat: 0.00050306, change: 1.23, isHot: false, logo: 'https://cryptologos.cc/logos/pepe-pepe-logo.png', decimals: 8, flash: null, chart: genChart(), volume: '350M', tag: 'Meme', marketCap: '1.7B', supply: '420T', dominance: '0.1%' },
  { symbol: 'ZEC', name: 'Zcash', price: 527.89, fiat: 64613.74, change: -1.47, isHot: false, logo: 'https://cryptologos.cc/logos/zcash-zec-logo.png', decimals: 2, flash: null, chart: genChart(), volume: '80M', tag: 'Privacy', marketCap: '800M', supply: '16M', dominance: '0.05%' },
  { symbol: 'AT', name: 'Artfinity', price: 0.1863, fiat: 22.80, change: 18.66, isHot: false, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24203.png', decimals: 4, flash: null, chart: genChart(), volume: '5M', tag: 'NFT', marketCap: '120M', supply: '650M', dominance: '0.01%' },
  { symbol: 'AUCTION', name: 'Bounce', price: 5.75, fiat: 703.80, change: 17.35, isHot: false, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8602.png', decimals: 2, flash: null, chart: genChart(), volume: '45M', tag: 'Web3', marketCap: '38M', supply: '6.5M', dominance: '0.002%' },
];

const QuickAction = ({ icon: Icon, label, colorClass, bgClass, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group cursor-pointer">
    <div className={`w-14 h-14 rounded-full ${bgClass} ${colorClass} flex items-center justify-center shadow-sm group-active:scale-95 transition-all duration-200 ring-1 ring-inset ring-black/5 dark:ring-white/5`}>
      <Icon size={24} strokeWidth={2} />
    </div>
    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
  </button>
);

const MiniChart = ({ 
  data, 
  isPositive, 
  id, 
  className = ''
}: { 
  data: number[], 
  isPositive: boolean, 
  id: string,
  className?: string
}) => {
  const viewBoxWidth = 200;
  const viewBoxHeight = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 5;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * viewBoxWidth;
    const y = viewBoxHeight - padding - ((d - min) / range) * (viewBoxHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const fillPath = `${points} ${viewBoxWidth},${viewBoxHeight} 0,${viewBoxHeight}`;
  
  const color = isPositive ? '#10B981' : '#EF4444';
  const gradientId = `chart-grad-${id}`;

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className={`w-full h-full overflow-hidden ${className}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <polyline 
        points={points} 
        fill="none" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <polygon points={fillPath} fill={`url(#${gradientId})`} />
    </svg>
  );
};

export const Home: React.FC<HomeProps> = ({ user, theme, onThemeChange, onNavigate, onBack, canGoBack }) => {
  const [activeRankTab, setActiveRankTab] = useState('Hot');
  const [marketData, setMarketData] = useState<MarketCoin[]>(INITIAL_MARKET_DATA);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCoin, setExpandedCoin] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTC', 'ETH', 'BNB']));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(currentData => {
        const updatedData = currentData.map(coin => {
          if (Math.random() > 0.6) {
             const volatility = 0.002;
             const changeFactor = 1 + (Math.random() - 0.5) * volatility;
             const newPrice = coin.price * changeFactor;
             const isUp = newPrice > coin.price;
             
             const newChart = [...coin.chart.slice(1), newPrice];

             return {
               ...coin,
               price: newPrice,
               fiat: coin.fiat * changeFactor,
               change: coin.change + ((Math.random() - 0.5) * 0.02),
               flash: (isUp ? 'green' : 'red') as 'green' | 'red',
               chart: newChart
             };
          }
          return coin;
        });
        return updatedData;
      });

      setTimeout(() => {
        setMarketData(currentData => currentData.map(c => c.flash ? { ...c, flash: null } : c));
      }, 400);

    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, symbol: string) => {
      e.stopPropagation();
      const newFavs = new Set(favorites);
      if (newFavs.has(symbol)) {
          newFavs.delete(symbol);
      } else {
          newFavs.add(symbol);
      }
      setFavorites(newFavs);
  };

  const sortedData = useMemo(() => {
    let data = [...marketData];
    if (searchQuery) {
        data = data.filter(c => c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    switch (activeRankTab) {
        case 'Gainers': return data.sort((a, b) => b.change - a.change);
        case 'Losers': return data.sort((a, b) => a.change - b.change);
        case 'Hot': return data.sort((a, b) => (b.isHot === a.isHot) ? 0 : b.isHot ? 1 : -1);
        case 'New': return data.reverse(); 
        case 'Vol': return data; // Default order implies volume usually
        case 'Favorites': return data.filter(c => favorites.has(c.symbol));
        default: return data;
    }
  }, [marketData, activeRankTab, searchQuery, favorites]);

  const visibleMarketData = isExpanded ? sortedData : sortedData.slice(0, 10);

  // Top Mover Data for Spotlight
  const topGainer = useMemo(() => [...marketData].sort((a, b) => b.change - a.change)[0], [marketData]);
  const topLoser = useMemo(() => [...marketData].sort((a, b) => a.change - b.change)[0], [marketData]);
  const trending = useMemo(() => marketData.find(c => c.symbol === 'BTC'), [marketData]);
  
  const parseVolume = (vol: string) => {
      const num = parseFloat(vol.replace(/,/g, ''));
      if (vol.includes('T')) return num * 1000;
      if (vol.includes('B')) return num; 
      if (vol.includes('M')) return num / 1000;
      return num / 1000000;
  };
  
  const highVolume = useMemo(() => [...marketData].sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume))[0], [marketData]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = 260; // Card width + gap
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 transition-colors duration-300 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* 1. Header & Branding */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-center sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-50/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          {canGoBack && onBack ? (
            <button 
              onClick={onBack}
              className="p-2 mr-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm active:scale-95 transition-all hover:text-blue-600"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/20 ring-2 ring-white/20">
              T
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Trustio</h1>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Global Wallet</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-colors"
          >
            <Monitor size={18} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <Globe size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">EN</span>
          </button>
        </div>
      </header>

      <div className="px-4 space-y-6">
        
        {/* 2. Asset Valuation Card (Hero) */}
        <div className="relative w-full bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 overflow-hidden shadow-2xl shadow-slate-900/20 text-white transition-all hover:shadow-slate-900/30">
          <div className="absolute top-0 right-0 w-64 h-64 border border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-56 h-56 border border-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Wallet size={14} /> Total Assets
            </span>
            <h2 className="text-4xl font-black tracking-tight mb-6">
              ${user.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xl font-bold text-slate-400">USDT</span>
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <ArrowUp size={12} className="text-emerald-400" strokeWidth={3} />
                <span className="text-xs font-bold text-emerald-400">+$1,240.50</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <Zap size={12} className="text-blue-400 fill-blue-400" />
                <span className="text-xs font-bold text-blue-400">12.4% Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quick Action Grid */}
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          <QuickAction 
            icon={Wallet} 
            label="Wallet" 
            bgClass="bg-blue-50 dark:bg-blue-900/10" 
            colorClass="text-blue-600 dark:text-blue-400" 
            onClick={() => onNavigate('trade')} 
          />
          <QuickAction 
            icon={ArrowDownLeft} 
            label="Deposit" 
            bgClass="bg-emerald-50 dark:bg-emerald-900/10" 
            colorClass="text-emerald-600 dark:text-emerald-400" 
            onClick={() => onNavigate('trade')}
          />
          <QuickAction 
            icon={ArrowUpRight} 
            label="Withdraw" 
            bgClass="bg-rose-50 dark:bg-rose-900/10" 
            colorClass="text-rose-600 dark:text-rose-400" 
            onClick={() => onNavigate('trade')}
          />
          <QuickAction 
            icon={ArrowRightLeft} 
            label="Transfer" 
            bgClass="bg-violet-50 dark:bg-violet-900/10" 
            colorClass="text-violet-600 dark:text-violet-400" 
            onClick={() => onNavigate('trade')}
          />
          
          <QuickAction icon={HelpCircle} label="Help" bgClass="bg-amber-50 dark:bg-amber-900/10" colorClass="text-amber-600 dark:text-amber-400" onClick={() => onNavigate('profile')} />
          <QuickAction icon={TrendingUp} label="Invest" bgClass="bg-teal-50 dark:bg-teal-900/10" colorClass="text-teal-600 dark:text-teal-400" onClick={() => onNavigate('invest')} />
          <QuickAction icon={Crown} label="VIP" bgClass="bg-yellow-50 dark:bg-yellow-900/10" colorClass="text-yellow-600 dark:text-yellow-400" onClick={() => onNavigate('invest')} />
          <QuickAction icon={Headphones} label="Support" bgClass="bg-pink-50 dark:bg-pink-900/10" colorClass="text-pink-600 dark:text-pink-400" onClick={() => onNavigate('profile')} />
        </div>

        {/* 4. MARKET INTELLIGENCE SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          
          {/* Spotlight Cards (Carousel) */}
          <div className="pt-8 px-6 mb-2">
             <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Market Pulse <Activity size={18} className="text-blue-500" />
                </h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
             </div>
             
             <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 snap-x scroll-smooth">
                {/* Spotlight 1: Top Gainer */}
                {topGainer && (
                  <div className="min-w-[240px] snap-center bg-gradient-to-br from-[#10B981] to-[#059669] rounded-[1.5rem] p-5 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                     <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                           <Flame size={14} className="fill-white text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Top Gainer</span>
                     </div>
                     <div className="flex items-center gap-3 mb-3">
                         <img src={topGainer.logo} className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md" alt={topGainer.symbol} />
                         <div>
                            <h4 className="font-black text-xl leading-none">{topGainer.symbol}</h4>
                            <span className="text-xs font-medium opacity-80">{topGainer.name}</span>
                         </div>
                     </div>
                     <div className="flex items-end justify-between border-t border-white/10 pt-3 mt-1">
                        <span className="text-2xl font-bold tracking-tight">${topGainer.price.toLocaleString()}</span>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">+{topGainer.change.toFixed(2)}%</span>
                     </div>
                  </div>
                )}

                {/* Spotlight 2: Top Loser */}
                {topLoser && (
                  <div className="min-w-[240px] snap-center bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-[1.5rem] p-5 text-white shadow-lg shadow-rose-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                     <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                           <TrendingDown size={14} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Top Dip</span>
                     </div>
                     <div className="flex items-center gap-3 mb-3">
                         <img src={topLoser.logo} className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md" alt={topLoser.symbol} />
                         <div>
                            <h4 className="font-black text-xl leading-none">{topLoser.symbol}</h4>
                            <span className="text-xs font-medium opacity-80">{topLoser.name}</span>
                         </div>
                     </div>
                     <div className="flex items-end justify-between border-t border-white/10 pt-3 mt-1">
                        <span className="text-2xl font-bold tracking-tight">${topLoser.price.toLocaleString()}</span>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">{topLoser.change.toFixed(2)}%</span>
                     </div>
                  </div>
                )}

                {/* Spotlight 3: Highest Volume */}
                {highVolume && (
                  <div className="min-w-[240px] snap-center bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-[1.5rem] p-5 text-white shadow-lg shadow-violet-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                     <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                           <BarChart3 size={14} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">High Volume</span>
                     </div>
                     <div className="flex items-center gap-3 mb-3">
                         <img src={highVolume.logo} className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md" alt={highVolume.symbol} />
                         <div>
                            <h4 className="font-black text-xl leading-none">{highVolume.symbol}</h4>
                            <span className="text-xs font-medium opacity-80">{highVolume.name}</span>
                         </div>
                     </div>
                     <div className="flex items-end justify-between border-t border-white/10 pt-3 mt-1">
                        <span className="text-2xl font-bold tracking-tight">${highVolume.price.toLocaleString()}</span>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-1"><Activity size={10} /> {highVolume.volume}</span>
                     </div>
                  </div>
                )}

                {/* Spotlight 4: High Yield Promo */}
                <div 
                  onClick={() => onNavigate('invest')}
                  className="min-w-[240px] snap-center bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-[1.5rem] p-5 text-white shadow-lg shadow-cyan-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                     <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                           <Zap size={14} className="text-white fill-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Best Yield</span>
                     </div>
                     <div className="flex items-center gap-3 mb-3">
                         <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center">
                            <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" className="w-7 h-7" alt="USDT" />
                         </div>
                         <div>
                            <h4 className="font-black text-xl leading-none">USDT</h4>
                            <span className="text-xs font-medium opacity-80">Staking</span>
                         </div>
                     </div>
                     <div className="flex items-end justify-between border-t border-white/10 pt-3 mt-1">
                        <span className="text-2xl font-bold tracking-tight">8.2% <span className="text-sm opacity-80">APY</span></span>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-1">Earn <ArrowRight size={10} /></span>
                     </div>
                </div>
                
                {/* Spotlight 5: Trending */}
                {trending && (
                  <div className="min-w-[240px] snap-center bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-[1.5rem] p-5 text-white shadow-lg shadow-amber-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                     <div className="flex items-center gap-2 mb-4">
                         <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                           <TrendingUp size={14} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Market Leader</span>
                     </div>
                     <div className="flex items-center gap-3 mb-3">
                         <img src={trending.logo} className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md" alt={trending.symbol} />
                         <div>
                            <h4 className="font-black text-xl leading-none">{trending.symbol}</h4>
                            <span className="text-xs font-medium opacity-80">{trending.name}</span>
                         </div>
                     </div>
                     <div className="flex items-end justify-between border-t border-white/10 pt-3 mt-1">
                        <span className="text-2xl font-bold tracking-tight">${trending.price.toLocaleString()}</span>
                         <div className="bg-white/10 rounded-lg p-1 w-20 h-10">
                            <MiniChart data={trending.chart} isPositive={true} id={trending.symbol} />
                         </div>
                     </div>
                  </div>
                )}

                 {/* Spotlight 6: New Listings */}
                 <div className="min-w-[240px] snap-center bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-[1.5rem] p-5 text-white shadow-lg shadow-blue-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                     <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                           <Zap size={14} className="fill-yellow-300 text-yellow-300" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">New Listings</span>
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border border-white/30">?</div>
                           <div>
                             <span className="font-black text-lg block">Mystery</span>
                             <span className="text-xs opacity-80">Launchpad</span>
                           </div>
                        </div>
                     </div>
                     <button className="mt-1 bg-white/20 hover:bg-white/30 text-xs font-bold py-2 px-3 rounded-lg w-full transition-colors backdrop-blur-md">View Launchpad</button>
                  </div>
             </div>
          </div>

          <div className="p-6 pt-0">
            {/* Action Bar: Tabs & Search */}
            <div className="flex flex-col gap-4 mb-6 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-30 pt-4 pb-2 -mx-6 px-6 border-b border-slate-100 dark:border-slate-800">
               {/* Search */}
               <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search coin name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border border-transparent focus:border-blue-500/20"
                  />
               </div>

               {/* Modern Pill Tabs */}
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {['Hot', 'Favorites', 'Gainers', 'Losers', 'New', 'Vol'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveRankTab(tab)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                        activeRankTab === tab 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-white/20 scale-105 ring-1 ring-slate-900 dark:ring-white' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab === 'Favorites' && <Star size={10} className={activeRankTab === 'Favorites' ? 'fill-white dark:fill-slate-900' : ''} />}
                      {tab === 'Hot' && <Flame size={10} className={activeRankTab === 'Hot' ? 'fill-orange-500 text-orange-500' : ''} />}
                      {tab}
                    </button>
                  ))}
               </div>
            </div>

            {/* Asset Table Headers */}
            <div className="flex justify-between items-center px-4 mb-2 opacity-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span className="w-[30%]">Asset</span>
              <div className="flex flex-1 justify-end items-center gap-4">
                <span className="flex-1 text-center">Chart</span>
                <span className="w-[100px] text-right">Price / 24h</span>
              </div>
            </div>

            {/* Enhanced Asset List */}
            <div className="space-y-3">
              {visibleMarketData.map((item, index) => {
                const isExpandedItem = expandedCoin === item.symbol;
                
                return (
                  <div 
                    key={item.symbol} 
                    onClick={() => setExpandedCoin(isExpandedItem ? null : item.symbol)}
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                        isExpandedItem 
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-blue-200 dark:border-blue-900/50 shadow-lg' 
                        : 'bg-white dark:bg-slate-800/40 border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
                    }`}
                  >
                    {/* Main Row */}
                    <div className="flex items-center justify-between p-3 cursor-pointer">
                      
                      {/* Symbol & Logo */}
                      <div className="flex items-center gap-3 w-[30%] overflow-hidden relative">
                        <div className="relative shrink-0">
                          <img 
                              src={item.logo} 
                              alt={item.symbol} 
                              className="w-10 h-10 rounded-full object-contain bg-white dark:bg-slate-800 shadow-sm p-0.5" 
                          />
                          {/* Favorite Star Overlay */}
                          <div 
                             onClick={(e) => toggleFavorite(e, item.symbol)}
                             className={`absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 cursor-pointer hover:scale-110 transition-transform z-10`}
                          >
                              <Star size={10} className={favorites.has(item.symbol) ? "fill-yellow-400 text-yellow-400" : "text-slate-300 dark:text-slate-600"} />
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-slate-900 dark:text-white leading-none truncate">{item.symbol}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{item.tag}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sparkline */}
                      <div className="flex-1 h-10 flex flex-col items-center justify-center opacity-90 mx-2">
                          <MiniChart data={item.chart} isPositive={item.change >= 0} id={item.symbol} />
                      </div>

                      {/* Pricing Info & Button */}
                      <div className="w-[100px] flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                            item.flash === 'green' ? 'text-emerald-500 scale-105' : 
                            item.flash === 'red' ? 'text-rose-500 scale-105' : 
                            'text-slate-900 dark:text-white'
                        }`}>
                            ${item.price.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
                        </span>
                        
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            item.change >= 0 
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' 
                            : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                        }`}>
                            {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED DETAILS PANEL */}
                    <div className={`grid transition-all duration-300 ease-out ${isExpandedItem ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                       <div className="overflow-hidden bg-white dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 mx-1 rounded-b-3xl">
                          {/* Zoomed In Chart Area */}
                          <div className="px-4 pt-4 pb-2">
                              <div className="w-full h-32 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2 border border-slate-100 dark:border-slate-800 relative shadow-inner">
                                   <div className="absolute top-3 left-3 flex items-center gap-2">
                                       <Activity size={12} className="text-slate-400" />
                                       <span className="text-[10px] font-bold text-slate-500 uppercase">Live Trend</span>
                                   </div>
                                   <MiniChart 
                                      data={item.chart} 
                                      isPositive={item.change >= 0} 
                                      id={item.symbol} 
                                      className="w-full h-full"
                                   />
                              </div>
                          </div>

                          <div className="p-4 grid grid-cols-3 gap-4">
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><BarChart3 size={10} /> Market Cap</span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">${item.marketCap}</span>
                             </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Coins size={10} /> Supply</span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{item.supply}</span>
                             </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><PieChart size={10} /> Dominance</span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{item.dominance}</span>
                             </div>
                          </div>
                          
                          <div className="px-4 pb-4 flex gap-3">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onNavigate('trade'); }}
                                className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                              >
                                Trade {item.symbol} <ArrowRight size={12} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onNavigate('invest'); }}
                                className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs active:scale-95 transition-all"
                              >
                                Earn Yield
                              </button>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 group active:scale-95 uppercase tracking-widest"
            >
              {isExpanded ? (
                <>Collapse Market <ChevronUp size={14} /></>
              ) : (
                <>View All Assets <ChevronDown size={14} /></>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}