import React, { useState, useEffect } from 'react';
import { Activity, X, RefreshCw, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export const ActivityLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-card max-w-xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-slate-900">
              Audit Activity Log & Two-Way Sync History
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-surface-subtle"
              title="Refresh log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 shrink-0">
          All client decisions, classification overrides, simulated syncs, and outbound messages are logged in MongoDB with role attribution.
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No activity records logged yet.</p>
          ) : (
            logs.map((log) => {
              const isClient = log.actorRole === 'client';
              const isAssistant = log.actorRole === 'assistant';

              return (
                <div
                  key={log._id}
                  className="p-3 rounded bg-surface-subtle border border-border-subtle flex items-start gap-3 text-xs"
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                      isClient
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : isAssistant
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isClient ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : isAssistant ? (
                      <UserCheck className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {log.description}
                    </p>
                    <span className="text-[10px] uppercase text-slate-400 block mt-1">
                      Role: {log.actorRole} {log.userId?.name ? `• ${log.userId.name}` : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-border shrink-0 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-surface-subtle hover:bg-surface-hover text-xs font-medium text-slate-700 border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
