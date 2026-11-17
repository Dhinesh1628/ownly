import React, { useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Filter,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { ConversationRow } from './ConversationRow';
import { useUIStore } from '../store/uiStore';

export const ConversationList = ({
  conversations = [],
  isLoading,
  total = 0,
  onToggleStar,
  onArchive,
  onRefetch,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  const {
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    filterUnreadOnly,
    setFilterUnreadOnly,
    filterImportantOnly,
    setFilterImportantOnly,
  } = useUIStore();

  const currentSegment = searchParams.get('segment') || 'assistant-to-reply';

  // Format segment title
  const getSegmentTitle = () => {
    switch (currentSegment) {
      case 'assistant-to-reply':
        return 'Assistant to Reply';
      case 'client-to-reply':
        return 'Client to Reply';
      case 'no-reply-needed':
        return 'No Reply Needed';
      case 'action-required':
        return 'Action Required';
      case 'waiting-for-response':
        return 'Waiting for Response';
      case 'meetings-appointments':
        return 'Meetings & Dates';
      case 'important':
        return 'Important';
      case 'needs-review':
        return 'Needs Review';
      case 'archived':
        return 'Archived Threads';
      default:
        return 'Conversations';
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams, { replace: true });
  };

  // Keep search state synchronized with URL parameter
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Keyboard navigation listener (j/k, /, e, r)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'j') {
        // Move next
        e.preventDefault();
        const currentIndex = conversations.findIndex((c) => c._id === activeConversationId);
        if (currentIndex < conversations.length - 1) {
          setActiveConversationId(conversations[currentIndex + 1]._id);
        } else if (conversations.length > 0 && currentIndex === -1) {
          setActiveConversationId(conversations[0]._id);
        }
      } else if (e.key === 'k') {
        // Move previous
        e.preventDefault();
        const currentIndex = conversations.findIndex((c) => c._id === activeConversationId);
        if (currentIndex > 0) {
          setActiveConversationId(conversations[currentIndex - 1]._id);
        }
      } else if (e.key === 'e' && activeConversationId) {
        // Archive
        e.preventDefault();
        onArchive && onArchive(activeConversationId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, activeConversationId, onArchive, setActiveConversationId]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white border-r border-slate-100 w-full md:w-80 lg:w-96 select-none shrink-0">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {getSegmentTitle()}
            </h2>
            <span className="text-xs text-slate-400 tabular-nums font-semibold">
              {total}
            </span>
          </div>

          <button
            onClick={onRefetch}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <button
            type="submit"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ff4800] p-1 transition-colors"
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <input
            id="inbox-search-input"
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search emails (/)"
            className="w-full text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-full pl-8 pr-8 py-2 outline-none transition-all shadow-xs text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 pt-0.5 text-xs">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filterUnreadOnly
                ? 'bg-[#fff4f0] text-[#ff4800] border border-[#ffd4c4]'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread
          </button>

          <button
            onClick={() => setFilterImportantOnly(!filterImportantOnly)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filterImportantOnly
                ? 'bg-[#fff4f0] text-[#ff4800] border border-[#ffd4c4]'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Starred
          </button>
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse space-y-2 pb-3 border-b border-border-subtle">
                <div className="flex justify-between">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-8 bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-44 bg-slate-200 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded" />
                <div className="h-4 w-24 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          /* Clean Empty State */
          <div className="flex flex-col items-center justify-center p-8 text-center h-full text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-700">No conversations in this view</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              All items in {getSegmentTitle()} are currently handled or filtered out.
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationRow
              key={conv._id}
              conversation={conv}
              isSelected={conv._id === activeConversationId}
              onSelect={() => setActiveConversationId(conv._id)}
              onToggleStar={onToggleStar}
              onArchive={onArchive}
              activeSegment={currentSegment}
            />
          ))
        )}
      </div>
    </div>
  );
};
