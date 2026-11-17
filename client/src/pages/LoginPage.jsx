import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { OwnlyLogoMark } from '../components/OwnlyLogo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, demoLogin, loading, error } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('assistant');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = 'Ownly';
  }, []);

  // Prevent browser password manager from auto-populating personal credentials on load
  useEffect(() => {
    setEmail('');
    setPassword('');
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 120);
    return () => clearTimeout(timer);
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const user = await login(email, password);
        if (user.role === 'client') {
          navigate('/client');
        } else {
          navigate('/overview');
        }
      } else {
        const user = await register({ name, email, password, role });
        navigate('/onboarding');
      }
    } catch (err) {
      // error handled in authStore
    }
  };

  const handleDemoSignIn = async (targetRole) => {
    try {
      const user = await demoLogin(targetRole);
      if (user.role === 'client') {
        navigate('/client');
      } else {
        navigate('/overview');
      }
    } catch (err) {
      // error handled in authStore
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col items-center justify-center p-3 sm:p-4 bg-[#f8fafc] dark:bg-[#0b0f19] select-none relative overflow-hidden transition-colors">
      {/* Top right theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-3.5 right-3.5 z-20 p-2 rounded-[8px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-slate-600" />
        )}
      </button>

      {/* Main Card: 10px radius, 1px border, no heavy shadow, vertically centered */}
      <div className="w-full max-w-[370px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-sm p-4 sm:p-5 space-y-3 relative z-10 transition-colors my-auto">
        {/* 1. Header: Logo, Ownly, and single Tagline line */}
        <div className="text-center pt-0.5">
          <OwnlyLogoMark size={32} className="mx-auto mb-1.5" />
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Ownly
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every email has an owner.
          </p>
        </div>

        {/* 2. Mode Selector: Sign In / Create Account */}
        <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-[8px] text-xs">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1 rounded-[6px] text-center font-medium transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1 rounded-[6px] text-center font-medium transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Inline Error Message */}
        {error && (
          <div className="p-2 rounded-[8px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1.5 animate-in fade-in-50">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* 3. Form (FIRST, before demo buttons) */}
        <form onSubmit={handleSubmit} className="space-y-2.5" autoComplete="off">
          {/* Hidden shields to intercept Chrome's aggressive autofill */}
          <input
            type="text"
            name="prevent_autofill_username"
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="false"
          />
          <input
            type="password"
            name="prevent_autofill_password"
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="new-password"
          />

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="user_fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  autoComplete="off"
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-[8px] outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  Role Context
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('assistant')}
                    className={`py-1.5 rounded-[8px] border text-center transition-all font-medium text-xs ${
                      role === 'assistant'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Assistant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`py-1.5 rounded-[8px] border text-center transition-all font-medium text-xs ${
                      role === 'client'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Client
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
              Email Address
            </label>
            <input
              type="email"
              name="account_login_email"
              id="account_login_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="assistant@executive.ai"
              autoComplete="off"
              required
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-[8px] outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="account_login_password"
                id="account_login_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
                required
                className="w-full text-xs px-2.5 py-1.5 pr-8 bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-[8px] outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition-colors focus-visible:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-[8px] bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold transition-all disabled:opacity-60 shadow-xs flex items-center justify-center gap-1.5 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* 4. Divider labeled "Just reviewing?" */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
              Just reviewing?
            </span>
          </div>
        </div>

        {/* 5. Two Demo Buttons below (No "HQ" or "Exec" pills) */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => handleDemoSignIn('assistant')}
            disabled={loading}
            className="p-2 sm:p-2.5 rounded-[8px] border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 text-slate-800 dark:text-slate-200 transition-all text-left group shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Assistant view
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Full inbox and AI triage
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleDemoSignIn('client')}
            disabled={loading}
            className="p-2 sm:p-2.5 rounded-[8px] border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 text-slate-800 dark:text-slate-200 transition-all text-left group shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Client view
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Minimal reply queue
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
