import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Activity, ShieldCheck, Zap, Crown, Sparkles, Globe, Lock, ArrowLeft } from 'lucide-react';

interface InvestProps {
  onBack?: () => void;
  canGoBack?: boolean;
}

const PartnerLogo: React.FC<{ name: string; logo: string }> = ({ name, logo }) => {
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="relative bg-white dark:bg-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 rounded-2xl h-16 w-full flex items-center justify-center group-hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 group-hover:border-blue-200 dark:group-hover:border-blue-500/50 transition-all duration-300 overflow-hidden p-3.5">
        {/* Hover Background */}
        <div className="absolute inset-0 bg-slate-50/0 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-700/50 transition-colors duration-300"></div>
        
        {error ? (
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight relative z-10">
            {name.substring(0, 2)}
          </span>
        ) : (
          <img 
            src={logo} 
            alt={name}
            className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300 relative z-10"
            onError={() => setError(true)}
          />
        )}
      </div>
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-wider text-center">{name}</span>
    </div>
  );
};

export const Invest: React.FC<InvestProps> = ({ onBack, canGoBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [currentYield, setCurrentYield] = useState(3.00);
  const [minAmount, setMinAmount] = useState(1500);

  // Helper to generate a random record
  const generateRecord = () => {
    const users = ['3n', '8g', 'wi', 'g6', '7t', 'kj', '9m', 'ax', 'lp', 'zr'];
    const actions = ['Staking Reward', 'Withdraw', 'Deposit', 'Transfer'];
    const randomUser = users[Math.floor(Math.random() * users.length)] + '***';
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const amount = Math.floor(Math.random() * (50000 - 100) + 100).toLocaleString();
    const now = new Date();
    
    return {
      user: randomUser,
      action: randomAction,
      amount: amount,
      time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      id: Math.random().toString(36).substr(2, 9)
    };
  };

  // Initialize with some data
  const [records, setRecords] = useState(() => Array(7).fill(null).map(generateRecord));

  // Live update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRecords(prev => {
        const newRecord = generateRecord();
        // Add new record to top, remove last record to keep list size constant
        return [newRecord, ...prev.slice(0, 6)];
      });
    }, 2500); // Update every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePeriodSelect = (days: number) => {
    setSelectedPeriod(days);
    switch (days) {
      case 7:
        setCurrentYield(3.00);
        setMinAmount(1500);
        break;
      case 14:
        setCurrentYield(3.85);
        setMinAmount(2500);
        break;
      case 30:
        setCurrentYield(4.80);
        setMinAmount(5000);
        break;
      case 60:
        setCurrentYield(6.50);
        setMinAmount(8000);
        break;
      case 90:
        setCurrentYield(8.20);
        setMinAmount(12000);
        break;
      default:
        setCurrentYield(3.00);
        setMinAmount(1500);
    }
  };

  // Official Wordmarks for Partners
  const partners = [
    { name: 'Binance', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png' },
    { name: 'Coinbase', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/89.png' },
    { name: 'Bybit', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/521.png' },
    { name: 'Crypto.com', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1149.png' },
    { name: 'OKX', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png' },
    { name: 'KuCoin', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/311.png' },
    { name: 'Kraken', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/24.png' },
    { name: 'Bitfinex', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/77.png' },
    { name: 'Gemini', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/151.png' }
  ];

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto w-full bg-[#F8FAFC] dark:bg-slate-950 min-h-screen relative overflow-hidden transition-colors duration-300">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 via-purple-100/30 to-transparent dark:from-blue-900/20 dark:via-purple-900/10 -z-10 rounded-b-[3rem]"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl -z-10"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative">
            {canGoBack && onBack && (
               <button 
                  onClick={onBack}
                  className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm active:scale-95 transition-all hover:text-blue-600"
               >
                   <ArrowLeft size={20} />
               </button>
            )}
            
            <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl shadow-lg shadow-blue-500/20 text-white transform rotate-3">
                    <TrendingUp size={22} strokeWidth={2.5} />
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">Invest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Center</span></h1>
            </div>
            
            {/* Spacer for centering */}
            {canGoBack && <div className="w-10"></div>}
        </div>

        {/* Daily Limit Badge */}
        <div className="flex justify-center mb-6">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-orange-200 dark:border-orange-900/30 rounded-full pl-1 pr-4 py-1 flex items-center gap-2 shadow-sm ring-4 ring-orange-50/50 dark:ring-orange-900/10 hover:ring-orange-100 dark:hover:ring-orange-900/20 transition-all cursor-pointer">
                 <div className="bg-gradient-to-br from-orange-400 to-red-500 p-1.5 rounded-full text-white shadow-sm">
                    <Crown size={12} fill="currentColor" />
                 </div>
                 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    VIP Level: <span className="text-orange-600 dark:text-orange-400 font-extrabold">Gold</span>
                 </p>
            </div>
        </div>

        {/* Limits Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/30 mb-8 group transition-transform hover:scale-[1.02] duration-300">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex justify-between items-center">
                <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1.5 text-white/90">
                        <Activity size={14} className="animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Daily Limit</p>
                    </div>
                    <p className="font-black text-2xl tracking-tight drop-shadow-md">1,000 <span className="text-sm font-semibold opacity-90">USDT</span></p>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent mx-2"></div>
                <div className="text-right relative">
                     <div className="flex items-center justify-end gap-1.5 mb-1.5 text-white/90">
                        <p className="text-[10px] font-bold uppercase tracking-widest">Monthly Limit</p>
                        <ShieldCheck size={14} />
                    </div>
                    <p className="font-black text-2xl tracking-tight drop-shadow-md">30,000 <span className="text-sm font-semibold opacity-90">USDT</span></p>
                </div>
            </div>
        </div>

        {/* Main Investment Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-black/40 mb-10 relative overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 transition-colors">
            {/* Top decorative gradient line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>

            <div className="p-7">
                {/* Header inside card */}
                <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shadow-inner border border-teal-100 dark:border-teal-800/50">
                            <img src="https://cryptologos.cc/logos/tether-usdt-logo.png?v=025" className="w-7 h-7 drop-shadow-sm" alt="USDT" />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">USDT Staking</h2>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                Fixed Income <Sparkles size={10} />
                            </p>
                        </div>
                     </div>
                     <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-1 ring-2 ring-emerald-50 dark:ring-emerald-900/30">
                         <ShieldCheck size={10} strokeWidth={3} />
                         Guaranteed
                     </span>
                </div>

                {/* Yield Display */}
                <div className="flex justify-between items-end mb-8 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/50 dark:bg-amber-900/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Zap size={14} className="text-amber-500 fill-amber-500" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">APY Rate</p>
                        </div>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 tracking-tighter filter drop-shadow-sm">
                            {currentYield.toFixed(2)}%
                        </h2>
                    </div>
                    <div className="text-right pb-1 relative z-10">
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{selectedPeriod}<span className="text-sm text-slate-500 dark:text-slate-400 font-bold ml-1">Days</span></p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide">Lock Period</p>
                    </div>
                </div>

                {/* Duration Selector */}
                <div className="mb-6">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wider">Select Duration</p>
                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex gap-1 transition-colors">
                        {[7, 14, 30, 60, 90].map((day) => (
                            <button
                                key={day}
                                onClick={() => handlePeriodSelect(day)}
                                className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all duration-300 relative ${
                                    selectedPeriod === day 
                                    ? 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-700 dark:to-slate-600 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-black/5 dark:ring-white/5 scale-[1.02]' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {day}D
                                {selectedPeriod === day && (
                                    <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-blue-500/20 pointer-events-none"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Area */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                       <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Minimum Amount</p>
                       <p className="font-bold text-slate-900 dark:text-white">{minAmount.toLocaleString()} USDT</p>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group overflow-hidden relative">
                        <span className="relative z-10 flex items-center gap-2">
                           Start Earning Now
                           <Zap size={18} className="group-hover:fill-white transition-colors" />
                        </span>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </div>
            </div>
        </div>

        {/* Partners Section */}
        <div className="mb-10 relative">
             <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/60 dark:border-slate-800/60 -z-10 shadow-sm transition-colors"></div>

             <div className="flex items-center justify-between mb-6 px-4 pt-4">
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        Global Partners
                        <Globe size={16} className="text-blue-600 dark:text-blue-400" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">Trusted by leading exchanges worldwide</p>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm transition-colors">
                    <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Audited</span>
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-x-3 gap-y-4 px-4 pb-4">
                 {partners.map((partner, idx) => (
                     <PartnerLogo key={idx} name={partner.name} logo={partner.logo} />
                 ))}
             </div>
             
             {/* Trust indicators */}
             <div className="flex justify-center gap-8 pb-6 pt-2">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Lock size={12} className="text-slate-400 dark:text-slate-500" /> 256-bit Secure
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-slate-400 dark:text-slate-500" /> ISO Certified
                    </span>
                 </div>
             </div>
        </div>

         {/* Live Transactions - Glassmorphism Card */}
         <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] -mx-4 pt-8 pb-32 px-6 transition-colors">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                     <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                     </div>
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">Live Transactions</h3>
                </div>
                 <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1 shadow-sm transition-colors">
                    <Activity size={10} />
                    Real-time
                 </span>
            </div>

            <div className="space-y-3">
                {records.map((record) => (
                     <div key={record.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                record.amount.replace(/,/g, '') > '5000' ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 text-teal-600 dark:text-teal-400'
                            }`}>
                                <DollarSign size={18} strokeWidth={3} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{record.user}</p>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                   {record.action}
                                </p>
                            </div>
                         </div>
                         <div className="text-right">
                             <p className="font-black text-slate-900 dark:text-white text-base">+{record.amount} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">USDT</span></p>
                             <div className="flex items-center justify-end gap-2 mt-0.5">
                                <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500">{record.time}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase">{record.date}</span>
                             </div>
                         </div>
                     </div>
                ))}
            </div>
         </div>
    </div>
  );
};