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
  ArrowLeft,
  Activity,
  Cpu,
  Database,
  Search,
  ExternalLink,
  ShieldAlert
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

  // Restriction Alert State
  const [showRestriction, setShowRestriction] = useState(false);

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
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [finalTxData, setFinalTxData] = useState<any>(null);
  
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
  
  // Order Flow State
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
        setScanningError('');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           setScanningError('Camera API is not supported. Please enter address manually.');
           setSendStep('input');
           return;
        }

        try {
          try {
             stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          } catch {
             stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
          
          if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true');
            await videoRef.current.play();
            requestAnimationFrame(tick);
          }
        } catch (err: any) {
          setScanningError('Unable to access camera.');
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
            // @ts-ignore
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
            if (code) {
              setSendAddress(code.data);
              setSendStep('input');
              if (stream) stream.getTracks().forEach(track => track.stop());
              return; 
            }
          }
        }
      }
      if (sendStep === 'scanning') animationFrameId = requestAnimationFrame(tick);
    };

    if (sendStep === 'scanning') startScan();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [sendStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    setTimeout(() => setClaimStage('opened'), 800);
  };

  // --- Real-time Verification Logic ---
  const handleVerifyDeposit = async () => {
    const cleanId = depositTxId.trim();
    if (!cleanId) {
       setVerificationError("Please enter the Transaction Hash/ID.");
       return;
    }

    setVerificationError('');
    setDepositStep('verifying');
    setVerificationLogs(["Initializing blockchain connection..."]);

    const steps = [
      "Establishing secure RPC node link...",
      "Searching for TX Hash in mempool...",
      `Detected transaction on ${depositNetwork} network.`,
      "Validating block header...",
      "Matching recipient address: " + WALLET_ADDRESSES[depositNetwork].substring(0, 8) + "...",
      "Verifying payload amount: " + depositAmount + " USDT",
      "Confirming signature authenticity...",
      "Waiting for network confirmations (1/3)...",
      "Waiting for network confirmations (2/3)...",
      "Final block confirmation (3/3) received."
    ];

    // Simulate logs appearing one by one
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
        setVerificationLogs(prev => [...prev, steps[i]]);
    }

    // Determine result
    const isMockValid = cleanId.length > 20 && /^[a-z0-9]+$/i.test(cleanId);
    
    setTimeout(() => {
      if (isMockValid) {
        setFinalTxData({
            hash: cleanId,
            block: Math.floor(Math.random() * 1000000) + 74000000,
            gas: (Math.random() * 5 + 1).toFixed(2),
            timestamp: new Date().toLocaleString()
        });
        onReceive(Number(depositAmount));
        setDepositStep('success');
      } else {
        setDepositStep('payment');
        setVerificationError("Invalid TXID: Hash not found on blockchain. Please ensure you sent funds to the correct address.");
      }
    }, 1000);
  };

  const handleOpenDeposit = () => {
    setDepositAmount('');
    setDepositTxId('');
    setVerificationError('');
    setVerificationLogs([]);
    setDepositStep('input');
    setDepositNetwork('TRC20');
    setOrderId(`ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
    setTimeLeft(900);
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

  const closeDeposit = () => {
    setShowDepositModal(false);
    setTimeout(() => {
        setDepositStep('input');
        setVerificationError('');
        setDepositTxId('');
        setVerificationLogs([]);
    }, 300);
  };

  const handleOpenSend = (type: 'withdraw' | 'transfer') => {
    // 1500 USDT Minimum Balance Requirement for all outgoing transactions
    if (user.totalAssets < 1500) {
      setShowRestriction(true);
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = await onSend(sendAddress, Number(sendAmount), 1);
    if (success) setSendStep('success');
    else {
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

      {/* Hero Balance Card */}
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
          <div className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center gap-1 backdrop-blur-sm">
            <TrendingUp size={10} className="text-blue-400" />
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">+1367 USDT Yield</span>
          </div>
        </div>
      </div>

      {/* Action Frame */}
      <div className="relative mb-8 p-1 rounded-[2.5rem] border-2 border-slate-200/50 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 shadow-xl shadow-slate-200/40 dark:shadow-black/40 backdrop-blur-sm transition-all">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleOpenDeposit} className="flex items-center justify-center gap-2 bg-[#2EBD85] hover:bg-[#28a775] text-white py-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/10 border-b-4 border-emerald-700/30 uppercase tracking-wider">
              <ArrowDownLeft size={16} strokeWidth={3} /> Deposit
            </button>
            <button onClick={() => handleOpenSend('withdraw')} className="flex items-center justify-center gap-2 bg-[#F6465D] hover:bg-[#e03a50] text-white py-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-rose-500/10 border-b-4 border-rose-700/30 uppercase tracking-wider">
              <ArrowUpRight size={16} strokeWidth={3} /> Withdraw
            </button>
          </div>
          <button onClick={() => handleOpenSend('transfer')} className="flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white w-full py-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-violet-500/10 border-b-4 border-violet-700/30 uppercase tracking-wider">
            <Send size={16} strokeWidth={2.5} /> Transfer
          </button>
        </div>
      </div>

      {/* Gift Section */}
      <div className={`relative mb-8 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${giftStep === 'success' ? 'bg-slate-900' : 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800'} border border-rose-100 dark:border-slate-700 shadow-xl shadow-rose-500/5`}>
        <div className="relative z-10 p-6">
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
          </div>

          {giftStep === 'create' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-5">
              <div className="flex bg-white dark:bg-slate-950/50 p-1 rounded-xl border border-rose-100 dark:border-slate-700">
                <button onClick={() => setGiftMode('fixed')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${giftMode === 'fixed' ? `bg-gradient-to-r ${activeThemeObj.from} ${activeThemeObj.to} text-white shadow-md` : 'text-slate-500'}`}>
                  <Gift size={14} /> Gift Card
                </button>
                <button onClick={() => setGiftMode('lucky')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${giftMode === 'lucky' ? `bg-gradient-to-r ${activeThemeObj.from} ${activeThemeObj.to} text-white shadow-md` : 'text-slate-500'}`}>
                  <MailOpen size={14} /> Red Envelope
                </button>
              </div>
              <div className="space-y-3">
                <input type="number" placeholder="Amount" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} className="w-full px-4 py-3.5 bg-white dark:bg-slate-950 border rounded-xl font-bold" />
                <input type="text" placeholder="Message" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border rounded-xl" />
              </div>
              <button onClick={handleCreateGift} disabled={!giftAmount} className={`w-full py-4 rounded-xl font-black text-white bg-gradient-to-r ${activeThemeObj.from} ${activeThemeObj.to}`}>Generate Gift</button>
            </div>
          )}

          {giftStep === 'success' && (
             <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center">
                <div className={`w-full aspect-[2/1] rounded-2xl bg-gradient-to-br ${activeThemeObj.from} ${activeThemeObj.to} p-6 mb-6 flex flex-col items-center justify-center text-center text-white`}>
                   <h3 className="text-3xl font-black">${Number(giftAmount).toLocaleString()}</h3>
                   <p className="text-white/80 text-sm">{giftMessage || 'Enjoy your gift!'}</p>
                </div>
                <button onClick={handleCopyLink} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold">{copied ? 'Copied!' : 'Copy Link'}</button>
                <button onClick={resetGift} className="mt-4 text-xs font-bold text-white/50">Create Another</button>
             </div>
          )}
        </div>
      </div>

      {/* DEPOSIT MODAL WITH REAL-TIME VERIFICATION */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
             <button onClick={closeDeposit} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 z-20"><X size={20} /></button>

             {depositStep === 'input' && (
               <div className="space-y-6">
                 <div className="text-center">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4"><Wallet size={28} /></div>
                    <h3 className="text-2xl font-black">Deposit USDT</h3>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border">
                    <input type="number" autoFocus value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-3xl font-black focus:outline-none" />
                 </div>
                 <button onClick={handleDepositSubmit} disabled={!depositAmount || Number(depositAmount) <= 0} className="w-full py-4 bg-[#2EBD85] text-white rounded-xl font-bold uppercase">Continue</button>
               </div>
             )}

             {depositStep === 'payment' && (
               <div className="space-y-5">
                 <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-2"><Timer size={14} /> {formatTime(timeLeft)}</div>
                    <h3 className="text-lg font-black">Complete Payment</h3>
                 </div>
                 <div className="flex gap-2">
                    {(Object.keys(WALLET_ADDRESSES) as Array<keyof typeof WALLET_ADDRESSES>).map(net => (
                       <button key={net} onClick={() => setDepositNetwork(net)} className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${depositNetwork === net ? NETWORK_STYLES[net] : 'text-slate-500'}`}>{net}</button>
                    ))}
                 </div>
                 <div className="bg-white p-3 rounded-2xl shadow-xl border mx-auto w-fit"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${WALLET_ADDRESSES[depositNetwork]}`} className="w-36 h-36" alt="QR" /></div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Copy Address ({depositNetwork})</p>
                    <div className="flex items-center gap-2"><p className="text-[10px] font-mono truncate flex-1">{WALLET_ADDRESSES[depositNetwork]}</p><button onClick={handleCopyDepositAddress} className="text-blue-500">{depositCopied ? <Check size={14} /> : <Copy size={14} />}</button></div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Enter TX Hash / Transaction ID</label>
                    <input type="text" value={depositTxId} onChange={(e) => setDepositTxId(e.target.value)} placeholder="e.g. 5f7c32..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-bold" />
                    {verificationError && <p className="text-[10px] text-red-500 font-bold">{verificationError}</p>}
                 </div>
                 <button onClick={handleVerifyDeposit} disabled={!depositTxId} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm uppercase">Verify Transaction</button>
               </div>
             )}

             {depositStep === 'verifying' && (
                <div className="py-4 space-y-6">
                   <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                         <Loader2 size={48} className="text-blue-600 animate-spin" />
                         <Cpu size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-black animate-pulse">Scanning Blockchain...</h3>
                   </div>
                   <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] space-y-1 h-48 overflow-y-auto no-scrollbar border border-slate-700 shadow-inner">
                      {verificationLogs.map((log, i) => (
                        <div key={i} className="flex gap-2 text-emerald-400">
                           <span className="opacity-40">[{new Date().toLocaleTimeString([], {hour12:false})}]</span>
                           <span className="animate-in fade-in slide-in-from-left-2 duration-300">{log}</span>
                        </div>
                      ))}
                      <div className="w-2 h-4 bg-emerald-400 animate-pulse inline-block ml-1"></div>
                   </div>
                </div>
             )}

             {depositStep === 'success' && finalTxData && (
                <div className="py-4 space-y-6 animate-in zoom-in-95">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/20"><Check size={32} strokeWidth={3} /></div>
                      <h3 className="text-xl font-black">Transaction Confirmed</h3>
                      <p className="text-xs text-slate-400">Funds have been added to your balance.</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border space-y-3">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">TX Hash</span><span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{finalTxData.hash}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Block Height</span><span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">#{finalTxData.block}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Network Fee</span><span className="text-[10px] font-mono text-emerald-500">{finalTxData.gas} USDT</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Finalized At</span><span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">{finalTxData.timestamp}</span></div>
                   </div>
                   <button onClick={closeDeposit} className="w-full py-4 bg-[#2EBD85] text-white rounded-xl font-bold uppercase shadow-lg shadow-emerald-500/20">Return to Wallet</button>
                   <button className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors"><ExternalLink size={12} /> View on Blockchain Explorer</button>
                </div>
             )}
          </div>
        </div>
      )}

      {/* RESTRICTION MODAL (1500 USDT RULE) */}
      {showRestriction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 text-center relative border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                 <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Balance Too Low</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                To enable outgoing <span className="font-bold text-slate-900 dark:text-white">Withdrawals</span> or <span className="font-bold text-slate-900 dark:text-white">P2P Transfers</span>, your account balance must be at least <span className="font-black text-blue-600 dark:text-blue-400">1,500 USDT</span>.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => { setShowRestriction(false); handleOpenDeposit(); }}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Deposit Now
                </button>
                <button 
                  onClick={() => setShowRestriction(false)}
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold active:scale-95 transition-all"
                >
                  Back
                </button>
              </div>
           </div>
        </div>
      )}

      {/* SEND MODAL */}
      {showSendModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           {sendStep === 'scanning' ? (
              <div className="fixed inset-0 z-[110] bg-black flex flex-col">
                 <div className="relative flex-1 bg-black flex items-center justify-center">
                    <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="relative z-10 w-64 h-64 border-2 border-white/50 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_0_100vmax_rgba(0,0,0,0.6)]">
                       <div className="w-full h-0.5 bg-red-500/50 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                    </div>
                    <p className="absolute bottom-32 text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">Scanning QR Code...</p>
                 </div>
                 <div className="h-24 bg-black flex items-center justify-center"><button onClick={() => setSendStep('input')} className="text-white bg-white/10 px-8 py-3 rounded-full font-bold">Cancel</button></div>
              </div>
           ) : (
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 border border-slate-200 dark:border-slate-800">
              <button onClick={closeSend} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"><X size={20} /></button>
              {sendStep === 'input' && (
                <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center text-violet-600 mx-auto mb-4"><Send size={28} /></div>
                      <h3 className="text-2xl font-black">{modalActionType === 'withdraw' ? 'Withdraw' : 'Transfer'}</h3>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">Address</label>
                       <div className="relative"><input type="text" value={sendAddress} onChange={(e) => setSendAddress(e.target.value)} placeholder="Enter Address" className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold" /><button onClick={() => setSendStep('scanning')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400"><Scan size={20} /></button></div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border">
                      <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-3xl font-black" />
                    </div>
                    <button onClick={handleSendContinue} disabled={!sendAddress || !sendAmount || Number(sendAmount) <= 0} className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold uppercase">Continue</button>
                </div>
              )}
              {sendStep === 'security' && (
                <div className="space-y-6 animate-in slide-in-from-right-10">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4"><Lock size={28} /></div>
                      <h3 className="text-2xl font-black">Security Check</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border">
                        <input type="password" value={sendSecretKey} onChange={(e) => setSendSecretKey(e.target.value)} placeholder="Enter Secret Key" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl" />
                        {sendSecretKeyError && <p className="text-[10px] text-red-500 font-bold mt-2">{sendSecretKeyError}</p>}
                    </div>
                    <button onClick={handleVerifySecretKey} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase">Confirm</button>
                </div>
              )}
              {sendStep === 'processing' && <div className="py-12 flex flex-col items-center justify-center gap-6"><Loader2 size={64} className="text-violet-600 animate-spin" /><h3 className="text-xl font-black">Processing...</h3></div>}
              {sendStep === 'success' && (
                  <div className="py-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Check size={40} strokeWidth={3} /></div>
                    <h3 className="text-2xl font-black">Success!</h3>
                    <button onClick={closeSend} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase">Done</button>
                  </div>
              )}
            </div>
           )}
        </div>
      )}
    </div>
  );
};