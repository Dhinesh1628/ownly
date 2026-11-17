import React from 'react';
import { Star } from 'lucide-react';

export const ConversationRow = ({
  conversation,
  isSelected,
  onSelect,
  onToggleStar,
  activeSegment = '',
}) => {
  const {
    _id,
    subject,
    participants = [],
    snippet,
    lastMessageAt,
    isRead,
    isImportant,
    awaitingResponse,
    classification = {},
  } = conversation;

  const senderName = participants[0]?.name || participants[0]?.email?.split('@')[0] || 'Unknown';
  const label = classification.label || 'No Reply Needed';
  const needsReview = classification.needsReview || (classification.confidence < 0.65);
  const isManual = classification.source === 'manual';

  // Check if active segment implies this classification label
  const isImplied =
    (activeSegment === 'assistant-to-reply' && label === 'Assistant to Reply') ||
    (activeSegment === 'client-to-reply' && label === 'Client to Reply') ||
    (activeSegment === 'no-reply-needed' && label === 'No Reply Needed');

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffHours = Math.round((new Date() - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBadgeStyle = () => {
    switch (label) {
      case 'Client to Reply':
        return 'text-[#ff4800] bg-[#fff4f0] dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50';
      case 'Assistant to Reply':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50';
      case 'No Reply Needed':
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  // Determine at most ONE chip per row, chosen in priority order:
  // 1. Needs review
  // 2. Waiting
  // 3. Classification (hidden if implied)
  let singleChip = null;
  if (needsReview) {
    singleChip = (
      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60">
        Needs review
      </span>
    );
  } else if (awaitingResponse) {
    singleChip = (
      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        Waiting
      </span>
    );
  } else if (!isImplied) {
    singleChip = (
      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeStyle()}`}>
        {label}
        {isManual && ' • Set by you'}
      </span>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col py-3 px-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all select-none ${
        isSelected
          ? 'bg-[#fff4f0]/60 dark:bg-orange-950/30 border-l-[3.5px] border-l-[#ff4800] pl-3.5'
          : !isRead
          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 font-medium'
          : 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
      }`}
    >
      {/* Line 1: Sender (bold if unread) and Time (+ star only if starred) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!isRead && (
            <span
              className="w-2 h-2 rounded-full bg-[#ff4800] ring-2 ring-orange-500/20 shrink-0"
              title="Unread"
            />
          )}
          <span
            className={`text-xs truncate ${
              !isRead ? 'font-bold text-slate-900 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300 font-semibold'
            }`}
          >
            {senderName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Star ONLY for starred threads, never by default */}
          {isImportant && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar && onToggleStar(_id);
              }}
              className="p-0.5 text-amber-500 hover:text-amber-600 transition-colors"
              title="Starred"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </button>
          )}

          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums font-medium">
            {formatTime(lastMessageAt)}
          </span>
        </div>
      </div>

      {/* Line 2: Subject */}
      <div
        className={`text-xs truncate mt-0.5 ${
          !isRead ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-semibold text-slate-800 dark:text-slate-300'
        }`}
      >
        {subject}
      </div>

      {/* Line 3: One-line preview in muted text + At most ONE chip */}
      <div className="flex items-center justify-between gap-2 mt-1 min-w-0">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate min-w-0 flex-1 font-medium">
          {snippet || ''}
        </span>
        {singleChip}
      </div>
    </div>
  );
};
