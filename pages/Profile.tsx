import React, { useState, useEffect, useRef } from 'react';
import { User as UserType, Transaction } from '../types';
import { GoogleGenAI, Chat, Content, GenerateContentResponse } from "@google/genai";
import { 
  LogOut, 
  Settings, 
  Shield, 
  Smartphone, 
  MessageSquare, 
  ChevronRight, 
  User as UserIcon, 
  Wallet, 
  CreditCard, 
  ArrowLeft, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  SlidersHorizontal,
  HelpCircle,
  MessageCircle,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  Edit2,
  Camera,
  Bell,
  Fingerprint,
  Gift,
  Share2,
  Book,
  FileText,
  Info
} from 'lucide-react';

interface ProfileProps {
  user: UserType;
  onLogout: () => void;
  onUpdateUser: (user: UserType) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
}

const FAQS = [
  {
    id: '1',
    question: 'How do I deposit funds?',
    answer: 'Go to the Trade tab and click on "Deposit". Select your network (TRC20, BEP20, etc.), enter the amount, and scan the QR code to send funds to the generated wallet address.'
  },
  {
    id: '2',
    question: 'Is Trustio secure?',
    answer: 'Yes, Trustio uses 256-bit encryption and industry-standard security protocols. We also offer 2-Factor Authentication (2FA) and Biometric login for added protection.'
  },
  {
    id: '3',
    question: 'What is the minimum withdrawal amount?',
    answer: 'The minimum withdrawal amount depends on the asset and network congestion. Typically, it is around 10 USDT for TRC20 transfers.'
  },
  {
    id: '4',
    question: 'How long do P2P transfers take?',
    answer: 'Internal P2P transfers between Trustio users are instant and free of charge. You just need the recipient\'s username or email.'
  },
  {
    id: '5',
    question: 'Why is my transaction pending?',
    answer: 'Blockchain transactions require network confirmations. Depending on network traffic, this can take anywhere from 1 minute to 1 hour.'
  }
];

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const isInflow = ['Receive', 'P2P Received', 'Buy', 'Deposit'].some(t => tx.type.includes(t));
  const isP2P = tx.type.includes('P2P');
  
  // Determine network/method label for display
  let networkLabel = 'TRC20';
  if (isP2P) networkLabel = 'Internal';
  else if (tx.type === 'Buy') networkLabel = 'Card';
  
  // Status Color Logic
  const statusColor = tx.status === 'Completed' ? 'bg-emerald-500' : tx.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500';

  return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all shadow-sm active:scale-[0.99] duration-200 group hover:border-blue-500/20">
          <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-[3px] ${
                  isInflow 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400'
              }`}>
                  {isInflow ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
              </div>
              <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{tx.type}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isInflow 
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                          : isP2P 
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                      }`}>
                          {networkLabel}
                      </span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">•</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{tx.date.split(' ')[0]}</p>
                  </div>
              </div>
          </div>
          <div className="text-right">
              <p className={`font-black text-sm tracking-tight ${isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {isInflow ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.asset}</p>
                 <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></span>
              </div>
          </div>
      </div>
  );
};

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser, onBack, canGoBack }) => {
  // View States
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Consolidated Settings State
  const [settings, setSettings] = useState({
    twoFactor: true,
    biometric: false,
    smsVerification: true,
    pushNotifications: true,
    emailAlerts: true,
    marketingUpdates: false
  });
  
  // 2FA Confirmation State
  const [show2FAConfirm, setShow2FAConfirm] = useState(false);

  // Help Center State
  const [showHelp, setShowHelp] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Hello! I am the Trustio AI Assistant. I can help you with deposits, investments, and account security. How can I assist you today?', sender: 'agent', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // AI Session Ref
  const chatSessionRef = useRef<Chat | null>(null);

  // File Input Ref for Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a stable "Customer ID" based on email to distinguish from mutable Username
  const customerId = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < user.email.length; i++) {
        hash = user.email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash).toString().substring(0, 6).padEnd(6, '0');
  }, [user.email]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat, isTyping]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    if (key === 'twoFactor' && settings.twoFactor) {
        setShow2FAConfirm(true);
        return;
    }
    // Only toggle boolean values
    if (typeof settings[key] === 'boolean') {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const confirmDisable2FA = () => {
    setSettings(prev => ({ ...prev, twoFactor: false }));
    setShow2FAConfirm(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        let history: Content[] = [];
        // Preserve history if session exists
        if (chatSessionRef.current) {
            history = await chatSessionRef.current.getHistory();
        }
        
        // Always create a new chat instance with latest AI client (fresh key) and history
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are the specialized AI Support Agent for 'Trustio', a modern cryptocurrency wallet web application.
                
                **User Context:**
                - Username: ${user.username}
                - Email: ${user.email}
                - Customer ID: ${customerId}
                
                Your goal is to provide helpful, concise, and professional assistance to users regarding the app's features.
                
                **Trustio App Features Context:**
                1. **Home**: Users can view their Total Balance (Asset Valuation), Market Rankings (Hot, Gainers, Losers, New, 24h Vol), and access Quick Actions.
                2. **Invest**: A staking platform where users can stake USDT. 
                   - Periods: 7 days (3% APY), 14 days (3.85% APY), 30 days (4.8% APY), 60 days (6.5% APY), 90 days (8.2% APY).
                   - Features: VIP Levels, Daily/Monthly limits, Guaranteed returns.
                3. **Trade**:
                   - **Deposit**: Users select a network (TRC20, BEP20, ERC20), enter an amount, and get a QR code/address to send funds to.
                   - **Withdraw**: Send funds out.
                   - **Send**: Transfer to external wallets via address or QR scan.
                   - **P2P Transfer**: Free internal transfers to other Trustio users via username/email.
                   - **Gifts**: Create Crypto Gift Cards or Lucky Red Envelopes.
                4. **Profile**: 
                   - Settings: 2-Step Verification, Biometric ID, SMS Alerts.
                   - History: View transaction logs.
                   - Help: Access FAQs and this Live Chat.

                **Guidelines:**
                - Be friendly and polite.
                - Keep answers relatively short (under 100 words) unless a detailed explanation is needed.
                - If a user asks about a specific feature (e.g., "How to deposit?"), guide them to the specific tab (e.g., "Go to the Trade tab and click Deposit").
                - Do not provide financial advice (e.g., "Buy BTC now").
                - If asked about technical issues, suggest checking their internet or contacting support@trustio.com for account-specific issues.
                `,
            },
            history: history
        });
        
        chatSessionRef.current = chat;

        const result: GenerateContentResponse = await chat.sendMessage({ message: userText });
        const responseText = result.text;

        const agentMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: responseText || "I'm sorry, I couldn't generate a response. Please try again.",
            sender: 'agent',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
        console.error("AI Error:", error);
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: "I'm having trouble connecting to the server right now. Please check your connection or try again later.",
            sender: 'agent',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- Render Views ---

  if (showHistory) {
      const filteredTransactions = user.transactions.filter(tx => {
          if (activeFilter === 'All') return true;
          if (activeFilter === 'Deposit') return tx.type.includes('Receive') || tx.type.includes('Deposit');
          if (activeFilter === 'Withdraw') return tx.type.includes('Send');
          if (activeFilter === 'P2P') return tx.type.includes('P2P');
          return true;
      });

      return (
        <div className="pb-24 pt-6 px-4 max-w-lg mx-auto w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors animate-in slide-in-from-right-10 duration-300">
            {/* History Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl py-4 z-10 -mx-4 px-4 border-b border-slate-100 dark:border-slate-800">
                <button 
                    onClick={() => setShowHistory(false)}
                    className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm active:scale-95 transition-all hover:text-blue-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none">History</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">{user.transactions.length} Transactions</p>
                </div>
                <button className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                    <SlidersHorizontal size={18} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2.5 mb-6 overflow-x-auto no-scrollbar pb-2 px-1">
                {['All', 'Deposit', 'Withdraw', 'P2P'].map((filter) => (
                    <button 
                        key={filter} 
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                        activeFilter === filter 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}>
                        {filter}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                        <TransactionItem key={tx.id} tx={tx} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 opacity-60">
                        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <History size={32} strokeWidth={1.5} />
                        </div>
                        <p className="font-bold text-sm">No transactions found</p>
                    </div>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto w-full animate-in fade-in duration-500">
      
      {/* Top Header with Back Button (if navigation stack exists) */}
      <div className="flex items-center gap-3 mb-2">
         {canGoBack && onBack && (
             <button 
                onClick={onBack}
                className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm active:scale-95 transition-all hover:text-blue-600"
             >
                <ArrowLeft size={20} />
             </button>
         )}
      </div>

      {/* Header Profile */}
      <div className="flex flex-col items-center mb-8 pt-2">
        {/* Avatar Section - Click to Upload */}
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-2xl shadow-blue-500/10 overflow-hidden mb-5 transition-transform group-hover:scale-105 duration-300 relative">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                </div>
            </div>
            <div className="absolute bottom-4 right-0 p-2 bg-blue-600 rounded-full text-white border-4 border-white dark:border-slate-900 shadow-lg">
                <Edit2 size={14} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
        </div>
        
        {/* Username */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{user.username}</h2>

        {/* ID & Email Row */}
        <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                ID: {customerId}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {user.email}
            </span>
        </div>

        {/* VIP Badges */}
        <div>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-amber-200 dark:border-amber-900/50 shadow-sm">
                <Sparkles size={12} className="fill-amber-500 text-amber-500" /> VIP Gold
            </span>
        </div>
      </div>

      {/* Security Settings Section */}
      <div className="mb-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
         <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield size={16} className="text-blue-600 dark:text-blue-400" /> Security Settings
         </h3>
         <div className="space-y-6">
            
            {/* 2FA */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center shrink-0">
                     <Shield size={20} />
                  </div>
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Authentication</p>
                     <p className="text-[10px] font-bold text-slate-400">Google Authenticator</p>
                  </div>
               </div>
               <button 
                 onClick={() => toggleSetting('twoFactor')}
                 className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${settings.twoFactor ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${settings.twoFactor ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
            </div>

            {/* Biometric */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center shrink-0">
                     <Fingerprint size={20} />
                  </div>
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white text-sm">Biometric Login</p>
                     <p className="text-[10px] font-bold text-slate-400">FaceID / TouchID</p>
                  </div>
               </div>
               <button 
                 onClick={() => toggleSetting('biometric')}
                 className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${settings.biometric ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${settings.biometric ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
            </div>

            {/* SMS Verification */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                     <Smartphone size={20} />
                  </div>
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white text-sm">SMS Verification</p>
                     <p className="text-[10px] font-bold text-slate-400">Verified code login</p>
                  </div>
               </div>
               <button 
                 onClick={() => toggleSetting('smsVerification')}
                 className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${settings.smsVerification ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${settings.smsVerification ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
            </div>
         </div>
      </div>

      {/* Notifications Section */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
         <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell size={16} className="text-amber-500" /> Notifications
         </h3>
         <div className="space-y-6">
            {/* Push Notifications */}
            <div className="flex items-center justify-between">
               <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Push Notifications</span>
               <button 
                 onClick={() => toggleSetting('pushNotifications')}
                 className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${settings.pushNotifications ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
            </div>
            {/* Email Alerts */}
            <div className="flex items-center justify-between">
               <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Email Alerts</span>
               <button 
                 onClick={() => toggleSetting('emailAlerts')}
                 className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${settings.emailAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${settings.emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
            </div>
            {/* Marketing Updates */}
            <div className="flex items-center justify-between">
               <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Marketing Updates</span>
               <button 
                 onClick={() => toggleSetting('marketingUpdates')}
                 className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${settings.marketingUpdates ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${settings.marketingUpdates ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
            </div>
         </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Separated Help Center */}
        <button 
          onClick={() => setShowHelp(true)}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
        >
            <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle size={20} />
            </div>
            <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Help Center</p>
                <p className="text-[10px] text-slate-500">FAQs</p>
            </div>
        </button>

        {/* New Live Support Button */}
        <button 
          onClick={() => setShowChat(true)}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
        >
            <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare size={20} />
            </div>
            <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Live Support</p>
                <p className="text-[10px] text-slate-500">Chat With Our Assistance</p>
            </div>
        </button>
      </div>

      {/* MY ACTIVITY SECTION - Conditional Rendering */}
      {user.transactions && user.transactions.length > 0 && (
        <div className="animate-in slide-in-from-bottom-5 duration-500 delay-100 mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Activity</h3>
                <button 
                  onClick={() => setShowHistory(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  History <ChevronRight size={14} />
                </button>
            </div>
            <div className="space-y-3">
                {user.transactions.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} />
                ))}
            </div>
        </div>
      )}

      {/* Log Out Button - Moved to Bottom */}
      <div className="mt-8 mb-4">
        <button 
          onClick={onLogout}
          className="w-full p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors active:scale-95 shadow-sm border border-rose-100 dark:border-rose-900/20"
        >
            <LogOut size={20} /> Log Out
        </button>
      </div>

      {/* Support Chat Bubble */}
      <button 
        onClick={() => setShowChat(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center z-[60] transition-transform hover:scale-110 active:scale-95"
      >
        <MessageCircle size={28} />
      </button>

      {/* 2FA Confirmation Modal */}
      {show2FAConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Disable 2FA?</h3>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Disabling 2-Step Verification will significantly reduce your account security. Are you sure you want to proceed?
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShow2FAConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDisable2FA}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-colors"
                    >
                        Disable
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <div>
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white">Help Center</h3>
                      <p className="text-xs text-slate-500">Frequently Asked Questions</p>
                  </div>
                  <button onClick={() => setShowHelp(false)} className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm text-slate-500 dark:text-white">
                      <X size={20} />
                  </button>
               </div>
               
               <div className="p-4 overflow-y-auto">
                  <div className="relative mb-6">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                         type="text" 
                         placeholder="Search for help..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                  </div>

                  <div className="space-y-3">
                      {FAQS.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase())).map(faq => (
                          <div key={faq.id} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                              <button 
                                onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                                className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{faq.question}</span>
                                  {openFaqId === faq.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                              </button>
                              {openFaqId === faq.id && (
                                  <div className="p-4 pt-0 bg-white dark:bg-slate-900 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                      {faq.answer}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-center">
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Still need help?</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Our support team is available 24/7</p>
                      <button 
                        onClick={() => { setShowHelp(false); setShowChat(true); }}
                        className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                      >
                          Start Live Chat
                      </button>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full sm:max-w-sm h-[85vh] sm:h-[600px] sm:rounded-[2rem] rounded-t-[2rem] flex flex-col shadow-2xl animate-in slide-in-from-bottom-20 overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shadow-md shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Sparkles size={20} />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Trustio Assistant</h3>
                            <p className="text-[10px] opacity-80 flex items-center gap-1">
                                <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                            }`}>
                                {msg.text}
                                <p className={`text-[9px] mt-1 text-right opacity-70 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1.5 items-center">
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type a message..." 
                            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim() || isTyping}
                            className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
                        >
                            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};