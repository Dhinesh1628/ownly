import React from 'react';
import { Calendar, Clock, Users, ArrowUpRight } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const MeetingsCard = ({ meetings = [] }) => {
  const { setActiveConversationId } = useUIStore();

  if (!meetings || meetings.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded p-3 mb-4 shadow-subtle">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <span>Extracted Upcoming Meetings & Schedules</span>
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums">
          {meetings.length} detected from email stream
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {meetings.map((m, idx) => (
          <div
            key={idx}
            onClick={() => m.conversationId && setActiveConversationId(m.conversationId)}
            className="p-2.5 rounded bg-surface-subtle hover:bg-surface-hover border border-border-subtle cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-medium text-slate-900 group-hover:text-accent transition-colors line-clamp-1">
                  {m.title || m.subject}
                </span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-accent shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{m.date} {m.time ? `• ${m.time}` : ''}</span>
              </div>
            </div>

            {m.attendees && m.attendees.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 truncate">
                <Users className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{m.attendees.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
