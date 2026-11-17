import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Shield,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(user?.role || 'assistant');
  const [provider, setProvider] = useState('gmail');
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleCompleteConnection = async () => {
    setSyncing(true);
    setSyncProgress(25);

    setTimeout(() => setSyncProgress(60), 800);
    setTimeout(() => setSyncProgress(90), 1600);

    setTimeout(async () => {
      try {
        await api.post('/accounts/connect', {
          provider,
          address: provider === 'gmail' ? 'alex.hastings@gmail.com' : 'alex.hastings@outlook.com',
          displayName: `Primary (${provider.toUpperCase()})`,
        });

        setSyncProgress(100);
        setTimeout(() => {
          if (role === 'client') {
            navigate('/client');
          } else {
            navigate('/dashboard');
          }
        }, 500);
      } catch (err) {
        console.error('Account connect error:', err);
        navigate('/dashboard');
      }
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-zinc-900">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-lg shadow-card p-8 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-zinc-900 text-white tabular-nums flex items-center justify-center text-xs font-semibold">
              0{step}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                {step === 1 && 'Executive Mailbox Triage'}
                {step === 2 && 'Primary Role Context'}
                {step === 3 && 'Mailbox Integration'}
              </h2>
              <p className="text-xs text-zinc-500">
                {step === 1 && 'Step 1 of 3: Core Architecture'}
                {step === 2 && 'Step 2 of 3: Interface Preference'}
                {step === 3 && 'Step 3 of 3: Account Synchronization'}
              </p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s === step ? 'bg-zinc-900' : s < step ? 'bg-zinc-400' : 'bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              When a client reads an email, ambiguity often arises regarding who should reply. Ownly classifies every thread into three concrete buckets:
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded bg-zinc-50 border border-zinc-200 flex items-start gap-3 text-xs">
                <div className="w-5 h-5 rounded bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 block">
                    Assistant to Reply
                  </span>
                  <p className="text-zinc-500 mt-0.5">
                    Scheduling, calendar shifts, invoices, logistics, and standard operational follow-ups.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-50 border border-zinc-200 flex items-start gap-3 text-xs">
                <div className="w-5 h-5 rounded bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 block">
                    Client to Reply
                  </span>
                  <p className="text-zinc-500 mt-0.5">
                    High-stakes investor approvals, term sheets, confidential matters, personal signatures.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-50 border border-zinc-200 flex items-start gap-3 text-xs">
                <div className="w-5 h-5 rounded bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 block">
                    No Reply Needed
                  </span>
                  <p className="text-zinc-500 mt-0.5">
                    Newsletters, receipts, automated SaaS updates, and concluded threads.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-subtle flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Select your initial view. You can toggle between views anytime via the role pill in the top header.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRole('assistant')}
                className={`p-4 rounded border cursor-pointer transition-all ${
                  role === 'assistant'
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-zinc-800 mb-2" />
                <h4 className="text-xs font-semibold text-zinc-900">
                  Assistant HQ
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                  Full 3-pane command center: KPI stats, segments, drafting, and complete thread history.
                </p>
              </div>

              <div
                onClick={() => setRole('client')}
                className={`p-4 rounded border cursor-pointer transition-all ${
                  role === 'client'
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <Shield className="w-4 h-4 text-zinc-800 mb-2" />
                <h4 className="text-xs font-semibold text-zinc-900">
                  Client View (/client)
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                  Minimalist card stream showing strictly what requires personal executive attention.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-zinc-500 hover:text-zinc-900"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-subtle flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Connect your primary mailbox. For this prototype, OAuth token exchange is simulated and populates ~45 realistic executive conversations.
            </p>

            {!syncing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setProvider('gmail')}
                    className={`p-3.5 rounded border cursor-pointer transition-all flex items-center gap-3 ${
                      provider === 'gmail'
                        ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                      G
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-900 block">
                        Gmail
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        alex.hastings@gmail.com
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setProvider('outlook')}
                    className={`p-3.5 rounded border cursor-pointer transition-all flex items-center gap-3 ${
                      provider === 'outlook'
                        ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                      O
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-900 block">
                        Outlook
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        alex.hastings@outlook.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-zinc-500 hover:text-zinc-900"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCompleteConnection}
                    className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-subtle flex items-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize & Synchronize</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-4 border border-zinc-200 rounded-lg bg-zinc-50">
                <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">
                    Syncing 128 email threads...
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Running triage classification across threads
                  </p>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div
                    className="bg-zinc-900 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
