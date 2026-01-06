import React, { useState, useEffect } from 'react';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Invest } from './pages/Invest';
import { Profile } from './pages/Profile';
import { Trade } from './pages/Trade';
import { BottomNav } from './components/BottomNav';
import { User, NavTab, Transaction } from './types';

// Updated Admin/Default User
const DEFAULT_ADMIN: User = {
  username: 'Donation01',
  email: 'usacharities01@gmail.com',
  password: 'poorgift2026',
  secretKey: 'hfzXSjhfzXSj5a7Z6b9AH5a7Z6b9AH',
  totalAssets: 12500.50,
  monthlyYield: 342.15,
  transactions: [
    { id: 'tx-init-1', type: 'Receive', amount: 10000, asset: 'USDT', date: '2023-10-01 09:00', status: 'Completed', details: 'Initial Deposit' },
    { id: 'tx-init-2', type: 'Send', amount: 500, asset: 'USDT', date: '2023-10-05 14:30', status: 'Completed', details: 'External Wallet' }
  ]
};

type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [history, setHistory] = useState<NavTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('system');

  // Load users and theme from storage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('trustio_users');
    const storedSession = localStorage.getItem('trustio_session');
    const storedTheme = localStorage.getItem('trustio_theme') as Theme | null;
    
    let parsedUsers: User[] = [];

    if (storedUsers) {
      parsedUsers = JSON.parse(storedUsers);
      
      // Locate the default user (either by old admin ID or new email)
      const adminIndex = parsedUsers.findIndex(u => 
        u.username === 'admin' || 
        u.email === 'admin@trustio.com' || 
        u.email === DEFAULT_ADMIN.email
      );
      
      if (adminIndex !== -1) {
        // Force update credentials (username, email, pass, key) while preserving assets/history
        parsedUsers[adminIndex] = {
           ...parsedUsers[adminIndex], // Keep existing properties (like avatar)
           username: DEFAULT_ADMIN.username,
           email: DEFAULT_ADMIN.email,
           password: DEFAULT_ADMIN.password,
           secretKey: DEFAULT_ADMIN.secretKey, // Ensure key is updated
           // Preserve assets/txs if they exist, else default
           totalAssets: parsedUsers[adminIndex].totalAssets ?? DEFAULT_ADMIN.totalAssets,
           transactions: (parsedUsers[adminIndex].transactions && parsedUsers[adminIndex].transactions.length > 0)
              ? parsedUsers[adminIndex].transactions
              : DEFAULT_ADMIN.transactions
        };
        localStorage.setItem('trustio_users', JSON.stringify(parsedUsers));
      } else {
         // If default user doesn't exist at all, add them
         parsedUsers.push(DEFAULT_ADMIN);
         localStorage.setItem('trustio_users', JSON.stringify(parsedUsers));
      }
    } else {
      // Initialize with default user if no users exist
      parsedUsers = [DEFAULT_ADMIN];
      localStorage.setItem('trustio_users', JSON.stringify(parsedUsers));
    }

    setUsers(parsedUsers);

    if (storedSession) {
      // Check if session user credentials match the update
      const session = JSON.parse(storedSession);
      // If the session user is the admin but has old credentials/username, force re-login or update session
      if (
        (session.username === 'admin' || session.email === 'admin@trustio.com' || session.email === DEFAULT_ADMIN.email) &&
        (session.secretKey !== DEFAULT_ADMIN.secretKey)
      ) {
         // Update current session with new details immediately or logout
         const updatedSession = parsedUsers.find(u => u.email === DEFAULT_ADMIN.email) || null;
         if (updatedSession) {
             setCurrentUser(updatedSession);
             localStorage.setItem('trustio_session', JSON.stringify(updatedSession));
         } else {
             setCurrentUser(null);
             localStorage.removeItem('trustio_session');
         }
      } else {
         setCurrentUser(session);
      }
    }

    if (storedTheme) {
      setTheme(storedTheme);
    }

    setLoading(false);
  }, []);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('trustio_theme', theme);
  }, [theme]);

  // Listen for system theme changes if in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('trustio_session', JSON.stringify(user));
    setActiveTab('home');
    setHistory([]); // Reset history on login
  };

  const handleRegister = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('trustio_users', JSON.stringify(updatedUsers));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trustio_session');
    setActiveTab('home');
    setHistory([]);
  };

  // Helper to save user state
  const saveUserState = (updatedUser: User, allUsers: User[]) => {
    const newUsersList = allUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
    setUsers(newUsersList);
    setCurrentUser(updatedUser);
    localStorage.setItem('trustio_users', JSON.stringify(newUsersList));
    localStorage.setItem('trustio_session', JSON.stringify(updatedUser));
  };

  const handleUpdateUser = (updatedUser: User) => {
    saveUserState(updatedUser, users);
  };

  const createTransaction = (
    type: Transaction['type'], 
    amount: number, 
    details: string,
    status: Transaction['status'] = 'Completed'
  ): Transaction => ({
    id: 'tx-' + Math.random().toString(36).substr(2, 9),
    type,
    amount,
    asset: 'USDT',
    date: new Date().toLocaleString(),
    status,
    details
  });

  // Handle Receiving Funds (Deposit)
  const handleReceive = (amount: number) => {
    if (!currentUser) return;
    
    const newTx = createTransaction('Receive', amount, 'Deposit via Network');
    const updatedUser = {
      ...currentUser,
      totalAssets: currentUser.totalAssets + amount,
      transactions: [newTx, ...currentUser.transactions]
    };

    saveUserState(updatedUser, users);
  };

  // Handle Sending Funds (Withdraw)
  const handleSend = async (address: string, amount: number, fee: number): Promise<boolean> => {
    if (!currentUser) return false;
    
    // Enforcement: Minimum 1500 USDT balance to withdraw
    if (currentUser.totalAssets < 1500) return false;

    const totalDeduction = amount + fee;
    if (currentUser.totalAssets < totalDeduction) return false;

    const newTx = createTransaction('Send', amount, `To: ${address.substring(0, 6)}...`);
    const updatedUser = {
      ...currentUser,
      totalAssets: currentUser.totalAssets - totalDeduction,
      transactions: [newTx, ...currentUser.transactions]
    };

    saveUserState(updatedUser, users);
    return true;
  };

  // Handle P2P Transfer (Internal)
  const handleP2PTransfer = async (recipientUsername: string, amount: number): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    // Enforcement: Minimum 1500 USDT balance to transfer
    if (currentUser.totalAssets < 1500) {
      return { success: false, message: 'Minimum balance of 1,500 USDT required to enable transfers.' };
    }

    const targetUser = recipientUsername.trim();
    
    if (targetUser.toLowerCase() === currentUser.username.toLowerCase()) {
      return { success: false, message: 'Cannot transfer to yourself' };
    }
    
    if (amount <= 0) return { success: false, message: 'Invalid amount' };
    if (currentUser.totalAssets < amount) return { success: false, message: 'Insufficient balance' };

    const recipientIndex = users.findIndex(u => 
      u.username.toLowerCase() === targetUser.toLowerCase() || 
      u.email.toLowerCase() === targetUser.toLowerCase()
    );

    if (recipientIndex === -1) {
      return { success: false, message: 'User not found' };
    }

    // Update Sender
    const senderTx = createTransaction('P2P Sent', amount, `To: ${targetUser}`);
    const updatedSender = { 
      ...currentUser, 
      totalAssets: currentUser.totalAssets - amount,
      transactions: [senderTx, ...currentUser.transactions]
    };

    // Update Recipient (In memory list first)
    const updatedUsersList = [...users];
    const recipient = updatedUsersList[recipientIndex];
    const recipientTx = createTransaction('P2P Received', amount, `From: ${currentUser.username}`);
    
    const updatedRecipient = {
      ...recipient,
      totalAssets: recipient.totalAssets + amount,
      transactions: [recipientTx, ...recipient.transactions]
    };
    
    updatedUsersList[recipientIndex] = updatedRecipient;
    const finalUsersList = updatedUsersList.map(u => u.email === updatedSender.email ? updatedSender : u);
    
    setUsers(finalUsersList);
    setCurrentUser(updatedSender);
    localStorage.setItem('trustio_users', JSON.stringify(finalUsersList));
    localStorage.setItem('trustio_session', JSON.stringify(updatedSender));

    return { success: true, message: 'Transfer successful' };
  };

  // Navigation Logic
  const handleTabChange = (tab: NavTab) => {
    if (tab === activeTab) return;
    setHistory(prev => [...prev, activeTab]);
    setActiveTab(tab);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevTab = newHistory.pop();
    setHistory(newHistory);
    if (prevTab) setActiveTab(prevTab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} users={users} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      {activeTab === 'home' && (
        <Home 
          user={currentUser} 
          theme={theme} 
          onThemeChange={setTheme} 
          onNavigate={handleTabChange}
          onBack={handleBack}
          canGoBack={history.length > 0} 
        />
      )}
      {activeTab === 'invest' && (
        <Invest 
          onBack={handleBack} 
          canGoBack={history.length > 0} 
        />
      )}
      {activeTab === 'trade' && (
        <Trade 
          user={currentUser} 
          onReceive={handleReceive}
          onSend={handleSend}
          onP2P={handleP2PTransfer}
          onBack={handleBack}
          canGoBack={history.length > 0}
        />
      )}
      {activeTab === 'profile' && (
        <Profile 
          user={currentUser} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser}
          onBack={handleBack}
          canGoBack={history.length > 0}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default App;