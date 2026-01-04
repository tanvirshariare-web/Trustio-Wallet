import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  ShieldCheck, 
  TrendingUp, 
  Gift, 
  MailOpen, 
  QrCode, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Loader2, 
  Wallet, 
  Timer, 
  FileText, 
  Globe, 
  Scan, 
  Camera, 
  ArrowRight, 
  Eye, 
  Hash, 
  AlertCircle, 
  Key, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import { User } from '../types';
import jsQR from 'jsqr';

interface TradeProps {
  user: User;
  onReceive: (amount: number) => void;
  onSend: (address: string, amount: number, fee: number) => Promise<boolean>;
  onP2P: (recipient: string, amount: number) => Promise<{ success: boolean; message: string }>;
  onBack?: () => void;
  canGoBack?: boolean;
}

const WALLET_ADDRESSES = {
  TRC20: 'TLuwiqZGjSrx3ddaDnWq1e2uCszegMMEMD',
  BEP20: '0x9c5fa2ad2a79f1f05a72f8a114f3b6ef92dd04c1',
  ERC20: '0x9c5fa2ad2a79f1f05a72f8a114f3b6ef92dd04c1'
};

const NETWORK_STYLES: Record<string, string> = {
  TRC20: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 ring-0 border-transparent',
  BEP20: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30 ring-0 border-transparent',
  ERC20: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-0 border-transparent'
};

export const Trade: React.FC<TradeProps> = ({ user, onReceive, onSend, onBack, canGoBack }) => {
  // Gift Logic State
  const [giftMode, setGiftMode] = useState<'fixed' | 'lucky'>('fixed');
  const [giftStep, setGiftStep] = useState<'create' | 'success'>('create');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [giftAmount, setGiftAmount] = useState('');
  const [recipientCount, setRecipientCount] = useState('1');
  const [giftMessage, setGiftMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Claim Preview State
  const [showClaimPreview, setShowClaimPreview] = useState(false);
  const [claimStage, setClaimStage] = useState<'closed' | 'opening' | 'opened'>('closed');

  // Deposit Logic State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState<'input' | 'payment' | 'verifying' | 'success'>('input');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNetwork, setDepositNetwork] = useState<keyof typeof WALLET_ADDRESSES>('TRC20');
  const [depositCopied, setDepositCopied] = useState(false);
  const [depositTxId, setDepositTxId] = useState('');
  const [verificationError, setVerificationError] = useState('');
  
  // Send Logic State
  const [showSendModal, setShowSendModal] = useState(false);
  const [modalActionType, setModalActionType] = useState<'withdraw' | 'transfer'>('transfer');
  const [sendStep, setSendStep] = useState<'input' | 'scanning' | 'security' | 'processing' | 'success'>('input');
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendSecretKey, setSendSecretKey] = useState('');
  const [sendSecretKeyError, setSendSecretKeyError] = useState('');
  const [scanningError, setScanningError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sendNetwork, setSendNetwork] = useState<keyof typeof WALLET_ADDRESSES>('TRC20');
  
  // New: Order Flow State
  const [orderId, setOrderId] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  const themes = [
    { id: 'classic', label: 'Trustio Red', from: 'from-red-500', to: 'to-orange-600', icon: '🧧' },
    { id: 'birthday', label: 'Birthday', from: 'from-pink-500', to: 'to-rose-500', icon: '🎂' },
    { id: 'eid', label: 'Eid Mubarak', from: 'from-emerald-500', to: 'to-teal-500', icon: '🌙' },
    { id: 'festival', label: 'Festival', from: 'from-violet-500', to: 'to-purple-500', icon: '🎉' },
  ];

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (showDepositModal && depositStep === 'payment' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showDepositModal, depositStep, timeLeft]);

  // Scanner Effect
  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const startScan = async () => {
      if (sendStep === 'scanning') {
        // Reset error state
        setScanningError('');
        
        // Check API support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           setScanningError('Camera API is not supported. Please enter address manually.');
           setSendStep('input');
           return;
        }

        try {
          try {
             // Attempt to use the rear camera first
             stream = await navigator.mediaDevices.getUserMedia({ 
               video: { facingMode: 'environment' } 
             });
          } catch (firstErr) {
             console.warn("Rear camera not available, falling back to any video device...", firstErr);
             // Fallback to any available video device (e.g. laptop webcam)
             stream = await navigator.mediaDevices.getUserMedia({ 
               video: true 
             });
          }
          
          if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
            await videoRef.current.play();
            requestAnimationFrame(tick);
          }
        } catch (err: any) {
          console.error("Error accessing camera:", err);
          let errorMessage = 'Unable to access camera.';
          
          if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
             errorMessage = 'No camera found. Please enter address manually.';
          } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             errorMessage = 'Camera permission denied. Please allow access.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
             errorMessage = 'Camera is in use by another app.';
          }
          
          setScanningError(errorMessage);
          setSendStep('input');
        }
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // @ts-ignore - jsQR type definition might be missing in this env
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              setSendAddress(code.data);
              setSendStep('input');
              // Stop stream immediately upon success
              if (stream) {
                 stream.getTracks().forEach(track => track.stop());
              }
              return; 
            }
          }
        }
      }
      if (sendStep === 'scanning') {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (sendStep === 'scanning') {
      startScan();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sendStep]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gift Handlers
  const handleCreateGift = () => {
    const uniqueId = Math.random().toString(36).substring(7);
    setGeneratedLink(`https://trustio.app/claim/${uniqueId}`);
    setGiftStep('success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetGift = () => {
    setGiftStep('create');
    setGiftAmount('');
    setGiftMessage('');
    setRecipientCount('1');
  };

  const openClaimPreview = () => {
    setClaimStage('closed');
    setShowClaimPreview(true);
  };

  const handleOpenGift = () => {
    setClaimStage('opening');
    setTimeout(() => {
        setClaimStage('opened');
    }, 800); // Wait for open animation to finish before showing 'opened' state fully
  };

  // Deposit Handlers
  const handleOpenDeposit = () => {
    setDepositAmount('');
    setDepositTxId('');
    setVerificationError('');
    setDepositStep('input');
    setDepositNetwork('TRC20');
    setOrderId(`ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
    setTimeLeft(900); // Reset to 15 mins
    setShowDepositModal(true);
  };

  const handleDepositSubmit = () => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    setDepositStep('payment');
  };

  const handleCopyDepositAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESSES[depositNetwork]);
    setDepositCopied(true);
    setTimeout(() => setDepositCopied(false), 2000);
  };

  const handleVerifyDeposit = () => {
    setVerificationError('');
    
    // Simulate Blockchain Verification Logic
    const cleanId = depositTxId.trim();
    
    const isValidLength = cleanId.length > 15;
    const isAlphanumeric = /^[a-z0-9]+$/i.test(cleanId);
    const isValid = isValidLength && isAlphanumeric;

    if (!cleanId) {
       setVerificationError("Please enter the Transaction Hash/ID.");
       return;
    }

    setDepositStep('verifying');
    
    setTimeout(() => {
      if (isValid) {
        // Correct ID: Add balance
        onReceive(Number(depositAmount));
        setDepositStep('success');
      } else {
        // Wrong ID: Fail verification
        setDepositStep('payment');
        setVerificationError("Verification Failed: Invalid Transaction ID. Please check the blockchain explorer.");
      }
    }, 3000);
  };

  const closeDeposit = () => {
    setShowDepositModal(false);
    setTimeout(() => {
        setDepositStep('input');
        setVerificationError('');
        setDepositTxId('');
    }, 300);
  };

  // Send Handlers
  const handleOpenSend = (type: 'withdraw' | 'transfer') => {
    if (type === 'transfer' && user.totalAssets < 1500) {
      alert("Account Restriction: You need a minimum balance of 1,500 USDT to make transfers. Please deposit funds to unlock this feature.");
      return;
    }

    setModalActionType(type);
    setSendAddress('');
    setSendAmount('');
    setSendSecretKey('');
    setSendSecretKeyError('');
    setSendStep('input');
    setScanningError('');
    setShowSendModal(true);
  };

  const handleSendContinue = () => {
    if (!sendAddress || !sendAmount || Number(sendAmount) <= 0) return;
    setSendStep('security');
  };

  const handleVerifySecretKey = async () => {
    setSendSecretKeyError('');
    
    if (sendSecretKey !== user.secretKey) {
       setSendSecretKeyError('Invalid Secret Key. Please try again.');
       return;
    }

    setSendStep('processing');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = await onSend(sendAddress, Number(sendAmount), 1); // 1 USDT fee
    if (success) {
      setSendStep('success');
    } else {
      setSendStep('input');
      alert('Insufficient funds or invalid transaction');
    }
  };

  const closeSend = () => {
    setShowSendModal(false);
    setSendStep('input');
  };


  const activeThemeObj = themes.find(t => t.id === selectedTheme) || themes[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32 pt-4 px-4 max-w-lg mx-auto w-full transition-colors duration-300">
      
      {/* Back Button Header */}
      {canGoBack && onBack && (
         <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={onBack}
              className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm active:scale-95 transition-all hover:text-blue-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Trade</h1>
         </div>
      )}

      {/* 1. Scaled-down Hero Balance Card (Home Style) */}
      <div className="relative w-full bg-slate-900 dark:bg-black rounded-[2rem] p-6 overflow-hidden shadow-2xl shadow-slate-900/20 text-white mb-6 mt-2 border border-slate-800/50 transition-all hover:scale-[1.01]">
        <div className="absolute top-0 right-0 w-48 h-48 border border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 border border-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-600/10 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 opacity-50 mb-1">
            <ShieldCheck size={12} />
            <span className="text-[10px] font-semibold tracking-wider">Total Assets</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">
            ${user.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xl font-bold text-slate-400">USDT</span>
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center gap-1 backdrop-blur-sm">
              <TrendingUp size={10} className="text-blue-400" />
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">+1367 USDT Yield</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Enhanced Trade Action Frame */}
      <div className="relative mb-8 p-1 rounded-[2.5rem] border-2 border-slate-200/50 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 shadow-xl shadow-slate-200/40 dark:shadow-black/40 backdrop-blur-sm transition-all">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          
          <div className="grid grid-cols-2 gap-3">
            {/* Deposit Button Frame */}
            <button 
              onClick={handleOpenDeposit}
              className="flex items-center justify-center gap-2 bg-[#2EBD85] hover:bg-[#28a775] text-white py-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/10 border-b-4 border-emerald-700/30 uppercase tracking-wider"
            >
              <ArrowDownLeft size={16} strokeWidth={3} />
              Deposit
            </button>
            
            {/* Withdraw Button Frame */}
            <button 
              onClick={() => handleOpenSend('withdraw')}
              className="flex items-center justify-center gap-2 bg-[#F6465D] hover:bg-[#e03a50] text-white py-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-rose-500/10 border-b-4 border-rose-700/30 uppercase tracking-wider"
            >
              <ArrowUpRight size={16} strokeWidth={3} />
              Withdraw
            </button>
          </div>

          {/* Transfer Button Frame */}
          <button 
            onClick={() => handleOpenSend('transfer')}
            className="flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white w-full py-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-violet-500/10 border-b-4 border-violet-700/30 uppercase tracking-wider"
          >
            <Send size={16} strokeWidth={2.5} />
            Transfer
          </button>
        </div>
      </div>

      {/* 3. NEW FEATURE: Crypto Gift & Red Envelope */}
      <div className={`relative mb-8 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${giftStep === 'success' ? 'bg-slate-900' : 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800'} border border-rose-100 dark:border-slate-700 shadow-xl shadow-rose-500/5`}>
        {/* Dynamic Background for Gift Section */}
        <div className={`absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none transition-opacity duration-500 ${giftStep === 'success' ? 'opacity-20' : 'opacity-100'}`}>
            <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${activeThemeObj.from} ${activeThemeObj.to} rounded-full blur-3xl`}></div>
            <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr ${activeThemeObj.from} ${activeThemeObj.to} rounded-full blur-2xl opacity-60`}></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-6">
          
          {/* Header Area */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${activeThemeObj.from} ${activeThemeObj.to} text-white shadow-lg`}>
                {giftMode === 'fixed' ? <Gift size={20} /> : <MailOpen size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">
                  {giftStep === 'create' ? 'Send Crypto Gift' : 'Gift Created!'}
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">
                  {giftStep === 'create' ? 'Share the joy of crypto' : 'Ready to share'}
                </p>
              </div>
            </div>
            {giftStep === 'success' && (
               <button onClick={resetGift} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                 <X size={18} />
               </button>
            )}
          </div>

          {/* CREATE STEP */}
          {giftStep === 'create' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-5">
              
              {/* Toggle Mode */}
              <div className="flex bg-white dark:bg-slate-950/50 p-1 rounded-xl border border-rose-100 dark:border-slate-700">
                <button 
                  onClick={() => setGiftMode('fixed')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    giftMode === 'fixed' 
                    ? `bg-gradient-to-r ${activeThemeObj.from} ${activeThemeObj.to} text-white shadow-md` 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Gift size={14} /> Gift Card
                </button>
                <button 
                  onClick={() => setGiftMode('lucky')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    giftMode === 'lucky' 
                    ? `bg-gradient-to-r ${activeThemeObj.from} ${activeThemeObj.to} text-white shadow-md` 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <MailOpen size={14} /> Red Envelope
                </button>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Select Theme</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t.id)}
                      className={`flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-xl border transition-all ${
                        selectedTheme === t.id 
                        ? 'bg-white dark:bg-slate-800 border-rose-400 shadow-md scale-105' 
                        : 'bg-white/50 dark:bg-slate-900/50 border-transparent opacity-70 grayscale'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.from} ${t.to} flex items-center justify-center text-sm shadow-sm`}>
                        {t.icon}
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                   <input 
                      type="number" 
                      placeholder="Total Amount"
                      value={giftAmount}
                      onChange={(e) => setGiftAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                   />
                </div>
                
                {giftMode === 'lucky' && (
                  <div className="relative animate-in slide-in-from-top-2">
                    <input 
                        type="number" 
                        placeholder="Number of Recipients"
                        value={recipientCount}
                        onChange={(e) => setRecipientCount(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                    />
                  </div>
                )}

                <input 
                    type="text" 
                    placeholder="Message (e.g. Happy Birthday!)"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                />
              </div>

              <button 
                onClick={handleCreateGift}
                disabled={!giftAmount}
                className={`w-full py-4 rounded-xl font-black text-white text-sm uppercase tracking-wide shadow-lg shadow-rose-500/20 active:scale-95 transition-all bg-gradient-to-r ${activeThemeObj.from} ${activeThemeObj.to} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Generate {giftMode === 'fixed' ? 'Gift Link' : 'Red Packets'}
              </button>

              <p className="text-[10px] text-center text-slate-400 leading-tight px-4">
                Funds are temporarily locked. If not claimed within 24 hours, they will be automatically refunded to your balance.
              </p>
            </div>
          )}

          {/* SUCCESS STEP */}
          {giftStep === 'success' && (
             <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center">
                {/* Visual Card */}
                <div className={`w-full aspect-[1.8/1] rounded-2xl bg-gradient-to-br ${activeThemeObj.from} ${activeThemeObj.to} p-6 relative overflow-hidden shadow-2xl mb-6 flex flex-col items-center justify-center text-center group`}>
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                   
                   <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl mb-3 mx-auto shadow-inner border border-white/20">
                         {activeThemeObj.icon}
                      </div>
                      <p className="text-white/90 text-sm font-medium mb-1">{giftMessage || (giftMode === 'fixed' ? 'Here is a gift!' : 'Lucky Packet')}</p>
                      <h3 className="text-3xl font-black text-white tracking-tight">${Number(giftAmount).toLocaleString()}</h3>
                      {giftMode === 'lucky' && <span className="text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full mt-2 inline-block">{recipientCount} Lucky Winners</span>}
                   </div>
                </div>

                {/* Link Area */}
                <div className="w-full bg-slate-800/50 rounded-xl p-1 flex items-center gap-2 border border-slate-700 mb-4">
                    <div className="flex-1 bg-slate-900 rounded-lg px-3 py-2.5 overflow-hidden">
                       <p className="text-xs text-slate-400 truncate font-mono">{generatedLink}</p>
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className={`p-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>

                {/* QR */}
                <div className="flex justify-center mb-6">
                   <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedLink)}&margin=10`}
                        alt="Claim QR Code" 
                        className="w-44 h-44 mix-blend-multiply"
                      />
                   </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs shadow-lg shadow-green-900/20 active:scale-95 transition-all">
                        Share via WhatsApp
                    </button>
                    <button className="flex-1 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                        Share via Telegram
                    </button>
                  </div>

                  {/* Preview Button */}
                  <button 
                    onClick={openClaimPreview}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl font-bold text-xs border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Preview Recipient View
                  </button>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* 4. DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
             
             {/* Close Button */}
             <button 
                onClick={closeDeposit} 
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
             >
               <X size={20} />
             </button>

             {/* STEP 1: INPUT */}
             {depositStep === 'input' && (
               <div className="space-y-6">
                 <div className="text-center">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
                      <Wallet size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Deposit USDT</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter amount to generate invoice</p>
                 </div>
                 
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Amount</label>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-black text-slate-400">$</span>
                       <input 
                          type="number" 
                          autoFocus
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-transparent text-3xl font-black text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-300"
                       />
                       <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">USDT</span>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    {[50, 100, 500].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => setDepositAmount(amt.toString())}
                        className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        ${amt}
                      </button>
                    ))}
                 </div>

                 <button 
                    onClick={handleDepositSubmit}
                    disabled={!depositAmount || Number(depositAmount) <= 0}
                    className="w-full py-4 bg-gradient-to-r from-[#2EBD85] to-[#00d293] hover:from-[#28a775] hover:to-[#00b880] text-white rounded-xl font-bold text-base shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide mt-2 ring-1 ring-white/20"
                 >
                    Continue
                 </button>
               </div>
             )}

             {/* STEP 2: INVOICE & PAYMENT */}
             {depositStep === 'payment' && (
               <div className="space-y-5 animate-in slide-in-from-right-10">
                 {/* Header & Timer */}
                 <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                      <Timer size={14} />
                      {formatTime(timeLeft)} Remaining
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Complete Payment</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">Order ID: <span className="text-slate-600 dark:text-slate-300 font-mono">{orderId}</span></p>
                 </div>

                 {/* Network Selector */}
                 <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-2">
                    {(Object.keys(WALLET_ADDRESSES) as Array<keyof typeof WALLET_ADDRESSES>).map(net => (
                       <button
                         key={net}
                         onClick={() => setDepositNetwork(net)}
                         className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border ${
                            depositNetwork === net 
                            ? NETWORK_STYLES[net] 
                            : 'bg-transparent border-transparent text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                         }`}
                       >
                          {net}
                       </button>
                    ))}
                 </div>

                 {/* QR Code */}
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 mx-auto w-fit relative group">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(WALLET_ADDRESSES[depositNetwork] + '?amount=' + depositAmount)}&margin=10`}
                      alt="Payment QR"
                      className="w-44 h-44 mix-blend-multiply"
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       Scan to Pay
                    </div>
                 </div>

                 {/* Address Box */}
                 <div className="space-y-2">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                          <Wallet size={10} /> Wallet Address ({depositNetwork})
                       </p>
                       <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate flex-1">{WALLET_ADDRESSES[depositNetwork]}</p>
                          <button onClick={handleCopyDepositAddress} className="text-blue-500 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors">
                             {depositCopied ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* TXID Input */}
                 <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Transaction Hash / ID</label>
                        {verificationError && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse">
                                <AlertCircle size={10} /> {verificationError}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Hash size={16} />
                       </div>
                       <input 
                          type="text" 
                          value={depositTxId}
                          onChange={(e) => setDepositTxId(e.target.value)}
                          placeholder="Paste Transaction ID here..."
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                             verificationError 
                             ? 'border-red-500/50 focus:ring-red-500/20' 
                             : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20'
                          }`}
                       />
                    </div>
                 </div>

                 {/* Amount Summary */}
                 <div className="flex justify-between items-center px-2 py-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <span className="text-xs font-bold text-slate-500">Total Amount</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">${Number(depositAmount).toLocaleString()} <span className="text-xs text-slate-400">USDT</span></span>
                 </div>

                 <button 
                    onClick={handleVerifyDeposit}
                    disabled={!depositTxId}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <Check size={18} /> Verify Deposit
                 </button>
               </div>
             )}

             {/* STEP 3 & 4 match deposit flow */}
             {(depositStep === 'verifying' || depositStep === 'success') && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                   {depositStep === 'verifying' ? <Loader2 size={64} className="text-blue-600 animate-spin" /> : <Check size={48} className="text-emerald-500" />}
                   <h3 className="text-xl font-black text-slate-900 dark:text-white">{depositStep === 'verifying' ? 'Verifying Transaction...' : 'Success!'}</h3>
                   <p className="text-xs text-slate-400 px-6">
                      {depositStep === 'verifying' ? 'Please wait while we confirm your transaction on the blockchain.' : 'Your deposit has been confirmed and added to your balance.'}
                   </p>
                   {depositStep === 'success' && (
                     <button onClick={closeDeposit} className="w-full py-3 bg-[#2EBD85] text-white rounded-xl font-bold text-sm">Done</button>
                   )}
                </div>
             )}

          </div>
        </div>
      )}

      {/* 5. TRANSFER MODAL (Previously Send Modal) */}
      {showSendModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           {/* SCANNER OVERLAY */}
           {sendStep === 'scanning' ? (
              <div className="fixed inset-0 z-[110] bg-black flex flex-col">
                 <div className="relative flex-1 bg-black flex items-center justify-center">
                    <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    
                    {/* Viewfinder UI */}
                    <div className="relative z-10 w-64 h-64 border-2 border-white/50 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_0_100vmax_rgba(0,0,0,0.6)]">
                       <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -mt-1 -ml-1"></div>
                       <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -mt-1 -mr-1"></div>
                       <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -mb-1 -ml-1"></div>
                       <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -mb-1 -mr-1"></div>
                       <div className="w-full h-0.5 bg-red-500/50 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                    </div>
                    
                    <p className="absolute bottom-32 text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Scanning QR Code...</p>
                 </div>
                 
                 <div className="h-24 bg-black flex items-center justify-between px-8">
                     <button onClick={() => setSendStep('input')} className="text-white flex flex-col items-center gap-1 opacity-80 hover:opacity-100">
                         <X size={24} />
                         <span className="text-[10px] font-bold">Cancel</span>
                     </button>
                     <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
                         <div className="w-12 h-12 bg-white rounded-full"></div>
                     </div>
                     <button className="text-white flex flex-col items-center gap-1 opacity-50">
                         <Sparkles size={24} />
                         <span className="text-[10px] font-bold">Light</span>
                     </button>
                 </div>
              </div>
           ) : (
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
              <button 
                onClick={closeSend} 
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
              >
                <X size={20} />
              </button>

              {sendStep === 'input' && (
                <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400 mx-auto mb-4">
                        <Send size={28} className="-ml-1 mt-1" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {modalActionType === 'withdraw' ? 'Withdraw Crypto' : 'Transfer Crypto'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {modalActionType === 'withdraw' ? 'Withdraw USDT to external wallet' : 'Transfer USDT to external wallet'}
                      </p>
                    </div>

                    {scanningError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-xl border border-red-100 dark:border-red-800 text-center">
                        {scanningError}
                      </div>
                    )}

                    {/* Network Selector */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-2">
                      {(Object.keys(WALLET_ADDRESSES) as Array<keyof typeof WALLET_ADDRESSES>).map(net => (
                          <button
                            key={net}
                            onClick={() => setSendNetwork(net)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border ${
                              sendNetwork === net 
                              ? NETWORK_STYLES[net] 
                              : 'bg-transparent border-transparent text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                          >
                            {net}
                          </button>
                      ))}
                    </div>

                    {/* Recipient Input */}
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Recipient Address</label>
                       <div className="relative">
                          <input 
                              type="text" 
                              value={sendAddress}
                              onChange={(e) => setSendAddress(e.target.value)}
                              placeholder={`Enter ${sendNetwork} Address`}
                              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          />
                          <button 
                            onClick={() => setSendStep('scanning')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all"
                          >
                             <Scan size={20} />
                          </button>
                       </div>
                    </div>

                    {/* Amount Input */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between mb-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Amount</label>
                         <span className="text-[10px] font-bold text-slate-500">Bal: {user.totalAssets.toLocaleString()} USDT</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-slate-400">$</span>
                          <input 
                            type="number" 
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent text-3xl font-black text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-300"
                          />
                          <button 
                             onClick={() => setSendAmount(user.totalAssets.toString())}
                             className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-1 rounded uppercase"
                          >
                            Max
                          </button>
                      </div>
                    </div>

                    <button 
                      onClick={handleSendContinue}
                      disabled={!sendAddress || !sendAmount || Number(sendAmount) <= 0}
                      className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold text-base shadow-xl shadow-violet-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide mt-2 ring-1 ring-white/20 flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                </div>
              )}

              {/* SECURITY STEP */}
              {sendStep === 'security' && (
                <div className="space-y-6 animate-in slide-in-from-right-10">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-4">
                        <Lock size={28} className="-ml-0.5" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Security Check</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verify ownership to continue</p>
                    </div>

                    {sendSecretKeyError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-xl border border-red-100 dark:border-red-800 text-center animate-pulse flex items-center justify-center gap-2">
                        <AlertCircle size={14} /> {sendSecretKeyError}
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Your Secret Key</label>
                         <div className="relative">
                            <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="password" 
                                value={sendSecretKey}
                                onChange={(e) => setSendSecretKey(e.target.value)}
                                placeholder="Enter your secret key"
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                         </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">You are transferring <span className="font-black text-slate-900 dark:text-white">{Number(sendAmount).toLocaleString()} USDT</span> to</p>
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 truncate max-w-[250px] mx-auto bg-white dark:bg-slate-900 py-1 px-2 rounded border border-slate-100 dark:border-slate-800">{sendAddress}</p>
                    </div>

                    <button 
                      onClick={handleVerifySecretKey}
                      disabled={!sendSecretKey}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-base shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      Confirm {modalActionType === 'withdraw' ? 'Withdrawal' : 'Transfer'}
                    </button>
                </div>
              )}

              {sendStep === 'processing' && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                    <Loader2 size={64} className="text-violet-600 animate-spin" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Processing Transaction</h3>
                  </div>
              )}

              {sendStep === 'success' && (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 mb-2">
                        <Check size={48} strokeWidth={4} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{modalActionType === 'withdraw' ? 'Withdrawal' : 'Transfer'} Successful!</h3>
                      <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                          <div className="flex justify-between mb-1">
                             <span className="text-xs font-bold text-slate-400 uppercase">Amount</span>
                             <span className="text-sm font-black text-slate-900 dark:text-white">${Number(sendAmount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-xs font-bold text-slate-400 uppercase">To</span>
                             <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{sendAddress}</span>
                          </div>
                      </div>
                    </div>
                    <button 
                      onClick={closeSend}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all uppercase tracking-wide"
                    >
                      Done
                    </button>
                  </div>
              )}
            </div>
           )}
        </div>
      )}

    </div>
  );
};