import React from 'react';
import { HelpCircle, X, Command } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const KeyboardHelpModal = () => {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useUIStore();

  if (!shortcutsModalOpen) return null;

  const shortcuts = [
    { key: 'j', desc: 'Select next conversation in stream' },
    { key: 'k', desc: 'Select previous conversation in stream' },
    { key: 'e', desc: 'Archive selected conversation (with Undo)' },
    { key: 'r', desc: 'Open reply composer for selected conversation' },
    { key: 'Ctrl+K', desc: 'Toggle "Ask AI" assistant drawer' },
    { key: '/', desc: 'Focus global search input bar' },
    { key: '?', desc: 'Open this keyboard shortcuts cheat-sheet' },
    { key: 'Esc', desc: 'Close dialogs, drawer panels, or focus states' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-card max-w-sm w-full p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-slate-900">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-1.5 border-b border-border-subtle text-xs"
            >
              <span className="text-slate-600">{item.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-surface-subtle border border-border font-sans font-medium text-[11px] text-slate-800 shadow-subtle">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="w-full py-1.5 rounded bg-surface-subtle hover:bg-surface-hover text-xs font-medium text-slate-700 border border-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
