import React, { useState } from 'react';
import { User, Lock, Mail, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
  users: UserType[];
  onRegister: (user: UserType) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, users, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const identifier = formData.username.trim().toLowerCase();

    const user = users.find(u => 
      (u.username.toLowerCase() === identifier || 
       u.email.toLowerCase() === identifier) && 
      u.password === formData.password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username/email or password');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.username || !formData.email || !formData.password || !formData.secretKey) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const cleanUsername = formData.username.trim();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      setError('Username already exists');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setError('Email already exists');
      return;
    }

    const newUser: UserType = {
      username: cleanUsername,
      email: cleanEmail,
      password: formData.password,
      secretKey: formData.secretKey,
      totalAssets: 0,
      monthlyYield: 0,
      transactions: []
    };

    onRegister(newUser);
    setSuccess('Account created successfully! Please login.');
    setIsLogin(true);
    setFormData({ username: '', email: '', password: '', confirmPassword: '', secretKey: '' });
    
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-center items-center px-6 py-12 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 p-8 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            {isLogin ? 'Sign in to manage your crypto' : 'Join Trustio today'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400 text-sm border border-green-100 dark:border-green-900/30">
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <Input 
              label="Email Address" 
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
            />
          )}
          
          <Input 
            label={isLogin ? "Username or Email" : "Username"} 
            name="username"
            type="text"
            placeholder={isLogin ? "Enter username or email" : "Choose a username"}
            icon={User}
            value={formData.username}
            onChange={handleChange}
          />

          <Input 
            label="Password" 
            name="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
          />

          {!isLogin && (
            <>
              <Input 
                label="Confirm Password" 
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Input 
                label="Secret Key (Recovery)" 
                name="secretKey"
                type="text"
                placeholder="Enter a secret phrase"
                icon={Key}
                value={formData.secretKey}
                onChange={handleChange}
              />
            </>
          )}

          <Button type="submit" fullWidth className="mt-4">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="ml-2 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};