import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  LogOut,
  Send,
  X,
  Undo2,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export const ClientView = ({ conversations = [], onRefresh, isLoading }) => {
  const { user, logout } = useAuthStore();
  const { addToast, theme, toggleTheme } = useUIStore();

  const [expandedId, setExpandedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Delegation modal state (optional note)
  const [delegateModalOpen, setDelegateModalOpen] = useState(false);
  const [delegateTarget, setDelegateTarget] = useState(null);
  const [delegateNote, setDelegateNote] = useState('');

  // Undo handled state
  const [lastHandledConv, setLastHandledConv] = useState(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Action 1: Mark as Handled with Undo Toast
  const handleMarkHandled = async (conv) => {
    setActionLoadingId(conv._id);
    try {
      await api.post(`/conversations/${conv._id}/client-handle`);
      setLastHandledConv(conv);

      // Trigger toast with undo notice
      addToast({
        title: 'Marked as handled',
        message: `"${conv.subject}" resolved.`,
        type: 'success',
      });

      // Clear any previous timer
      if (undoTimeoutId) clearTimeout(undoTimeoutId);
      const timer = setTimeout(() => {
        setLastHandledConv(null);
      }, 7000);
      setUndoTimeoutId(timer);

      onRefresh && onRefresh();
    } catch (err) {
      addToast({
        title: 'Action Failed',
        message: err.response?.data?.message || 'Could not complete action',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Undo Action
  const handleUndoHandled = async () => {
    if (!lastHandledConv) return;
    const conv = lastHandledConv;
    setLastHandledConv(null);
    if (undoTimeoutId) clearTimeout(undoTimeoutId);

    try {
      await api.post(`/conversations/${conv._id}/client-undo-handle`);
      addToast({
        title: 'Action Undone',
        message: `"${conv.subject}" restored to your action queue.`,
        type: 'info',
      });
      onRefresh && onRefresh();
    } catch (err) {
      addToast({ title: 'Undo Failed', message: 'Could not undo action', type: 'error' });
    }
  };

  // Action 2: Open Modal to Ask assistant to take over (with optional note)
  const openDelegateModal = (conv) => {
    setDelegateTarget(conv);
    setDelegateNote('');
    setDelegateModalOpen(true);
  };

  const handleConfirmDelegate = async () => {
    if (!delegateTarget) return;
    setActionLoadingId(delegateTarget._id);
    try {
      await api.post(`/conversations/${delegateTarget._id}/client-handoff`, {
        note: delegateNote.trim(),
      });
      addToast({
        title: 'Delegated to Assistant',
        message: `"${delegateTarget.subject}" sent to assistant queue.`,
        type: 'info',
      });
      setDelegateModalOpen(false);
      setDelegateTarget(null);
      setDelegateNote('');
      onRefresh && onRefresh();
    } catch (err) {
      addToast({
        title: 'Action Failed',
        message: err.response?.data?.message || 'Could not delegate thread',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Grouping items into: "Due today", "This week", "Later"
  const groupItems = (items) => {
    const dueToday = [];
    const thisWeek = [];
    const later = [];

    const nowPSTStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    });

    items.forEach((conv) => {
      const deadline = conv.extracted?.deadlines?.[0] || '';
      const deadlineLower = deadline.toLowerCase();

      if (deadlineLower.includes('today') || deadline.includes(nowPSTStr)) {
        dueToday.push(conv);
      } else if (
        deadlineLower.includes('mon') ||
        deadlineLower.includes('tue') ||
        deadlineLower.includes('wed') ||
        deadlineLower.includes('thu') ||
        deadlineLower.includes('fri') ||
        deadlineLower.includes('this week')
      ) {
        thisWeek.push(conv);
      } else {
        later.push(conv);
      }
    });

    return { dueToday, thisWeek, later };
  };

  const { dueToday, thisWeek, later } = groupItems(conversations);

  const renderSection = (title, items, badgeColor) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className={`text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
            {title} ({items.length})
          </span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <div className="space-y-3">
          {items.map((conv) => {
            const isExpanded = expandedId === conv._id;
            const isBusy = actionLoadingId === conv._id;
            const sender = conv.participants?.[0] || { name: 'Unknown', email: '' };
            const deadline = conv.extracted?.deadlines?.[0];

            return (
              <div
                key={conv._id}
                className="bg-surface border border-slate-200 hover:border-slate-300 rounded-lg shadow-subtle p-4 sm:p-5 space-y-3.5 transition-all"
              >
                {/* Header: Sender Avatar, Name, and Deadline */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-semibold text-xs flex items-center justify-center shrink-0">
                      {getInitials(sender.name)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-900 block truncate">
                        {sender.name || sender.email}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {sender.email}
                      </span>
                    </div>
                  </div>

                  {deadline && (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 tabular-nums">
                      {deadline}
                    </span>
                  )}
                </div>

                {/* Subject */}
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  {conv.subject}
                </h3>

                {/* Why you're needed Card */}
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Why you're needed:</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-normal">
                    {conv.classification?.reason || 'Direct executive decision required.'}
                  </p>
                </div>

                {/* AI Executive Summary */}
                {conv.summary && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    <strong className="text-slate-800">Summary: </strong>
                    {conv.summary}
                  </div>
                )}

                {/* Collapsible Original Thread Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-800 space-y-2">
                    <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wide">
                      Message preview
                    </span>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 whitespace-pre-line leading-relaxed text-slate-700 max-h-60 overflow-y-auto">
                      {conv.snippet}
                    </div>
                  </div>
                )}

                {/* Action Bar (Mobile-first full width, accessible $\ge$44px touch targets) */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-200/80">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : conv._id)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium py-1.5 sm:py-0"
                  >
                    <span>{isExpanded ? 'Hide original' : 'View full message'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => openDelegateModal(conv)}
                      disabled={isBusy}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-surface hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4 text-slate-500" />
                      <span>Ask assistant to take over</span>
                    </button>

                    <button
                      onClick={() => handleMarkHandled(conv)}
                      disabled={isBusy}
                      className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(255,72,0,0.3)] transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as handled</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-primary flex flex-col items-center transition-colors">
      {/* Clean Header */}
      <header className="w-full max-w-3xl px-5 sm:px-8 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#ff4800] flex items-center justify-center border border-orange-200 dark:border-orange-800/60 shadow-xs">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Needs your reply
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your assistant sees any changes you make here
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh items"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Undo Banner */}
      {lastHandledConv && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-hover flex items-center gap-3 text-xs animate-in slide-in-from-bottom">
          <span>Marked as handled: <strong>{lastHandledConv.subject.slice(0, 28)}...</strong></span>
          <button
            onClick={handleUndoHandled}
            className="px-3 py-1.5 rounded-xl bg-[#ff4800] hover:bg-[#ea3e00] text-white font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full max-w-3xl p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-surface p-6 rounded-lg border border-border space-y-3">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-5 w-72 bg-slate-200 rounded" />
                <div className="h-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          /* Empty State: You're all caught up */
          <div className="bg-surface border border-slate-200 rounded-lg p-12 text-center shadow-subtle space-y-3 my-8">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              You're all caught up
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              No emails currently require your personal signature, authorization, or response.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderSection('Due today', dueToday, 'text-rose-700')}
            {renderSection('This week', thisWeek, 'text-amber-800')}
            {renderSection('Later', later, 'text-slate-600')}
          </div>
        )}
      </main>

      {/* Optional Note Modal for "Ask assistant to take over" */}
      {delegateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-slate-100 rounded-3xl shadow-hover max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Ask assistant to take over
              </h3>
              <button
                onClick={() => setDelegateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Delegating: <strong className="text-slate-900">{delegateTarget?.subject}</strong>
              </p>
              <p className="text-slate-500 font-medium">
                Your assistant will receive this in their triage inbox.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Optional note for your assistant:
              </label>
              <textarea
                value={delegateNote}
                onChange={(e) => setDelegateNote(e.target.value)}
                placeholder="e.g. Please review schedule and counteroffer with Thursday 2 PM..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#ff4800] outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDelegateModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelegate}
                className="px-4 py-2 rounded-xl bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(255,72,0,0.3)] transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Delegate to assistant</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
