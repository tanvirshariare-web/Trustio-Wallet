import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-1">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input 
          className={`
            w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl border border-transparent 
            focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 
            transition-all duration-200 outline-none p-3.5
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' : 'hover:bg-white dark:hover:bg-slate-700 hover:border-gray-200 dark:hover:border-slate-600 shadow-inner dark:shadow-none'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>}
    </div>
  );
};