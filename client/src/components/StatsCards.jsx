import React from 'react';
import {
  Inbox,
  UserCheck,
  ShieldAlert,
  Clock,
  AlertCircle,
  Star,
  CheckCircle2,
} from 'lucide-react';

export const StatsCards = ({ stats = {}, onCardClick }) => {
  const cards = [
    {
      key: 'action-required',
      label: 'Action Required',
      value: stats.actionRequired ?? 0,
      icon: AlertCircle,
      desc: 'Requires triage or reply',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      key: 'assistant-to-reply',
      label: 'Assigned to Assistant',
      value: stats.assignedToAssistant ?? 0,
      icon: UserCheck,
      desc: 'Scheduling & operations',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      key: 'client-to-reply',
      label: 'Needs Client',
      value: stats.needsClient ?? 0,
      icon: ShieldAlert,
      desc: 'Executive signoff & decisions',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
    },
    {
      key: 'waiting-for-response',
      label: 'Awaiting Response',
      value: stats.awaitingResponse ?? 0,
      icon: Clock,
      desc: 'Outbound sent, waiting on lead',
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      key: 'important',
      label: 'Starred & Important',
      value: stats.important ?? 0,
      icon: Star,
      desc: 'Key accounts & investors',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      key: 'all',
      label: 'Active Threads',
      value: stats.total ?? 0,
      icon: Inbox,
      desc: 'Unarchived inbox volume',
      color: 'text-slate-700 bg-surface-subtle border-border',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            onClick={() => onCardClick && onCardClick(card.key)}
            className="bg-surface border border-border rounded p-3 hover:border-slate-400 cursor-pointer transition-colors shadow-subtle group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-500 truncate">{card.label}</span>
              <div className={`p-1 rounded border ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">{card.desc}</div>
          </div>
        );
      })}
    </div>
  );
};
