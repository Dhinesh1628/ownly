import React, { useState, useEffect } from 'react';
import {
  FolderSync,
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Lock,
  Info,
} from 'lucide-react';
import api from '../api/client';
import { useUIStore } from '../store/uiStore';

export const AccountsModal = ({ onAccountsChanged }) => {
  const { accountsModalOpen, setAccountsModalOpen, addToast } = useUIStore();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState(null);
  const [accountError, setAccountError] = useState(null);
  const [oauthStep, setOauthStep] = useState('idle'); // 'idle' | 'consent' | 'syncing' | 'success' | 'error'
  const [selectedProvider, setSelectedProvider] = useState('gmail');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatusText, setSyncStatusText] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data.data || []);
      setAccountError(null);
    } catch (err) {
      console.error('Failed to fetch email accounts:', err);
      setAccountError('Unable to load accounts. Please check server connection.');
    }
  };

  useEffect(() => {
    if (accountsModalOpen) {
      fetchAccounts();
      setOauthStep('idle');
      setAccountError(null);
    }
  }, [accountsModalOpen]);

  if (!accountsModalOpen) return null;

  // Format relative sync time
  const formatRelativeSyncTime = (dateString) => {
    if (!dateString) return 'Never synced';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Synced just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Synced ${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Synced ${diffHrs} hr ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Synced ${diffDays} d ago`;
  };

  // Start Simulated OAuth Flow
  const handleStartOAuth = (provider) => {
    setSelectedProvider(provider);
    setAccountError(null);
    setOauthStep('consent');
  };

  // User clicks "Authorize / Allow" on realistic consent screen
  const handleAuthorizeConsent = async () => {
    setOauthStep('syncing');
    setSyncProgress(20);
    setSyncStatusText('Connecting to simulated mail provider...');

    const timer1 = setTimeout(() => {
      setSyncProgress(55);
      setSyncStatusText('Fetching message threads and contacts...');
    }, 800);

    const timer2 = setTimeout(() => {
      setSyncProgress(85);
      setSyncStatusText('Applying executive triage classification...');
    }, 1600);

    const timer3 = setTimeout(async () => {
      try {
        await api.post('/accounts/connect', {
          provider: selectedProvider,
          address: selectedProvider === 'gmail' ? 'alex.hastings@gmail.com' : 'alex.hastings@outlook.com',
          displayName: `Alex Hastings (${selectedProvider.toUpperCase()})`,
        });

        setSyncProgress(100);
        setSyncStatusText('Synchronization complete!');
        setOauthStep('success');
        fetchAccounts();
        onAccountsChanged && onAccountsChanged();
        addToast({
          title: 'Account Connected',
          message: `Simulated ${selectedProvider.toUpperCase()} sync completed with sample threads.`,
          type: 'success',
        });
      } catch (err) {
        setOauthStep('error');
        setAccountError('Connection timeout or authorization rejected.');
      }
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Re-sync account
  const handleResync = async (id, address) => {
    setSyncingAccountId(id);
    setAccountError(null);
    try {
      await api.post(`/accounts/${id}/resync`);
      await fetchAccounts();
      onAccountsChanged && onAccountsChanged();
      addToast({
        title: 'Sync Complete',
        message: `Synchronized email stream for ${address}.`,
        type: 'success',
      });
    } catch (err) {
      setAccountError(`Sync failed for ${address}. Please retry.`);
      addToast({ title: 'Sync Failed', message: 'Could not sync mailbox', type: 'error' });
    } finally {
      setSyncingAccountId(null);
    }
  };

  // Disconnect account
  const handleDisconnect = async (id, address) => {
    if (!confirm(`Are you sure you want to disconnect ${address}?`)) return;
    try {
      await api.delete(`/accounts/${id}`);
      await fetchAccounts();
      onAccountsChanged && onAccountsChanged();
      addToast({
        title: 'Account Disconnected',
        message: `Disconnected ${address}.`,
        type: 'info',
      });
    } catch (err) {
      setAccountError(`Failed to disconnect ${address}.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-card max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-5 bg-surface">
          <div className="flex items-center gap-2.5">
            <FolderSync className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-slate-900">
              Connected Email Accounts
            </h3>
          </div>
          <button
            onClick={() => setAccountsModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-surface-subtle"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* One-Sentence Shortened Simulation Banner */}
          <div className="px-3.5 py-2.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Demo mode: Gmail and Outlook connection and sync are simulated with sample data.</span>
          </div>

          {/* Error Banner with Retry */}
          {accountError && (
            <div className="px-3.5 py-2.5 rounded bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{accountError}</span>
              </div>
              <button
                onClick={() => {
                  setAccountError(null);
                  fetchAccounts();
                }}
                className="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 font-medium text-[11px] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Conditional Sub-Views */}
          {oauthStep === 'consent' ? (
            /* Realistic Simulated Consent Screen */
            <div className="border border-border rounded-lg p-5 space-y-4 bg-surface-subtle/30">
              <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  selectedProvider === 'gmail' ? 'bg-red-500' : 'bg-blue-600'
                }`}>
                  {selectedProvider === 'gmail' ? 'G' : 'O'}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Sign in with {selectedProvider === 'gmail' ? 'Google' : 'Microsoft'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    to continue to Ownly
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-medium text-slate-900">
                  Ownly wants to access your email account:
                </p>
                <ul className="space-y-1 pl-4 list-disc text-slate-600">
                  <li>Read and manage message threads</li>
                  <li>Extract meeting requests and deadlines</li>
                  <li>Draft executive replies for review</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
                <button
                  onClick={() => setOauthStep('idle')}
                  className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAuthorizeConsent}
                  className="px-4 py-2 rounded-xl bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(255,72,0,0.3)] flex items-center gap-1.5 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Allow & Synchronize</span>
                </button>
              </div>
            </div>
          ) : oauthStep === 'syncing' ? (
            /* Clear Syncing Progress State */
            <div className="p-8 text-center space-y-4 border border-border rounded-2xl bg-surface-subtle/30">
              <div className="w-8 h-8 border-2 border-[#ff4800] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-900">{syncStatusText}</p>
                <p className="text-xs text-slate-500 mt-1 tabular-nums font-medium">
                  Sync in progress ({syncProgress}%)
                </p>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-[#ff4800] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          ) : oauthStep === 'error' ? (
            /* Clear Error State with Retry Button */
            <div className="p-6 text-center space-y-3 border border-rose-200 rounded-2xl bg-rose-50/50">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Synchronization Error
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Unable to complete account synchronization. Please verify connection and try again.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => setOauthStep('idle')}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAuthorizeConsent}
                  className="px-4 py-2 rounded-xl bg-[#ff4800] text-white text-xs font-semibold hover:bg-[#ea3e00] shadow-[0_4px_14px_rgba(255,72,0,0.3)] transition-all"
                >
                  Retry Synchronization
                </button>
              </div>
            </div>
          ) : oauthStep === 'success' ? (
            /* Success State */
            <div className="p-6 text-center space-y-3 border border-orange-200 rounded-2xl bg-[#fff4f0]/50">
              <CheckCircle2 className="w-8 h-8 text-[#ff4800] mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Account Successfully Linked
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                Mailbox stream connected and synchronized with your executive workspace.
              </p>
              <button
                onClick={() => setOauthStep('idle')}
                className="px-4 py-2 rounded-xl bg-[#ff4800] text-white text-xs font-semibold hover:bg-[#ea3e00] shadow-[0_4px_14px_rgba(255,72,0,0.3)]"
              >
                Done
              </button>
            </div>
          ) : (
            /* Normal Accounts List & Connect Triggers */
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Active Connected Inboxes
                </span>

                {accounts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-border rounded">
                    No accounts currently connected. Connect a demo account below.
                  </p>
                ) : (
                  <div className="divide-y divide-border-subtle border border-border rounded">
                    {accounts.map((acc) => {
                      const isSyncing = syncingAccountId === acc._id;
                      return (
                        <div
                          key={acc._id}
                          className="p-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-7 h-7 rounded bg-surface-subtle border border-border flex items-center justify-center shrink-0">
                              <Mail className="w-3.5 h-3.5 text-teal-600" />
                            </div>
                            <div className="truncate">
                              <span className="font-semibold text-slate-900 block truncate">
                                {acc.address}
                              </span>
                              <span className="text-[11px] text-slate-500 tabular-nums">
                                {acc.emailCount || 45} emails • {formatRelativeSyncTime(acc.lastSyncedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSyncing ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                                <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                                Syncing...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Connected
                              </span>
                            )}

                            <button
                              onClick={() => handleResync(acc._id, acc.address)}
                              disabled={isSyncing}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-surface-subtle transition-colors"
                              title="Resync emails now"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            </button>

                            <button
                              onClick={() => handleDisconnect(acc._id, acc.address)}
                              disabled={isSyncing}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Disconnect account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Account Buttons */}
              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Link New Mailbox
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStartOAuth('gmail')}
                    className="p-2.5 rounded border border-border hover:border-slate-400 bg-surface hover:bg-surface-subtle text-xs font-medium text-slate-800 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                      G
                    </span>
                    <span>Connect Gmail (Demo)</span>
                  </button>

                  <button
                    onClick={() => handleStartOAuth('outlook')}
                    className="p-2.5 rounded border border-border hover:border-slate-400 bg-surface hover:bg-surface-subtle text-xs font-medium text-slate-800 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="w-4 h-4 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      O
                    </span>
                    <span>Connect Outlook (Demo)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
