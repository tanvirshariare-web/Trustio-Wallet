import React from 'react';
import { Home, TrendingUp, RefreshCcw, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'invest', icon: TrendingUp, label: 'Invest' },
    { id: 'trade', icon: RefreshCcw, label: 'Trade' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-lg mx-auto pb-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 ${
                isActive ? 'text-blue-600 dark:text-blue-400 -translate-y-1' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-transparent'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-200`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};