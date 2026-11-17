import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Filter,
  Star,
  Folder,
  Archive,
  ChevronDown,
  ChevronRight,
  FolderSync,
  Activity,
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const Sidebar = ({ segmentCounts = {}, onOpenActivityModal }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeSegment,
    setActiveSegment,
    setAccountsModalOpen,
    setMobilePane,
  } = useUIStore();

  const [moreOpen, setMoreOpen] = useState(() => {
    try {
      return localStorage.getItem('sidebar_more_open') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMore = () => {
    const nextState = !moreOpen;
    setMoreOpen(nextState);
    try {
      localStorage.setItem('sidebar_more_open', String(nextState));
    } catch {
      // ignore
    }
  };

  const isOverview = location.pathname === '/overview';
  const currentSegment = isOverview ? 'overview' : (searchParams.get('segment') || activeSegment || 'assistant-to-reply');

  const handleSelectOverview = () => {
    navigate('/overview');
    setMobilePane('list');
  };

  const handleSelectSegment = (key) => {
    setActiveSegment(key);
    if (location.pathname !== '/dashboard') {
      navigate(`/dashboard?segment=${key}`);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('segment', key);
      newParams.delete('page');
      setSearchParams(newParams);
    }
    setMobilePane('list');
  };

  // Group 1: Who replies
  const whoRepliesItems = [
    {
      key: 'assistant-to-reply',
      label: 'Assistant to reply',
      icon: UserCheck,
      count: segmentCounts['assistant-to-reply'] ?? 0,
    },
    {
      key: 'client-to-reply',
      label: 'Client to reply',
      icon: ShieldAlert,
      count: segmentCounts['client-to-reply'] ?? 0,
    },
    {
      key: 'no-reply-needed',
      label: 'No reply needed',
      icon: CheckCircle2,
      count: segmentCounts['no-reply-needed'] ?? 0,
    },
  ];

  // Group 2: Follow-ups
  const followUpItems = [
    {
      key: 'needs-review',
      label: 'Needs review',
      icon: AlertTriangle,
      count: segmentCounts['needs-review'] ?? 0,
      isAmber: true,
    },
    {
      key: 'waiting-for-response',
      label: 'Waiting for response',
      icon: Clock,
      count: segmentCounts['waiting-for-response'] ?? 0,
    },
    {
      key: 'meetings-appointments',
      label: 'Meetings',
      icon: Calendar,
      count: segmentCounts['meetings-appointments'] ?? 0,
    },
  ];

  // Group 3: More (collapsible)
  const moreItems = [
    {
      key: 'action-required',
      label: 'Action required',
      icon: Filter,
      count: segmentCounts['action-required'] ?? 0,
    },
    {
      key: 'important',
      label: 'Important',
      icon: Star,
      count: segmentCounts['important'] ?? 0,
    },
    {
      key: 'general',
      label: 'General',
      icon: Folder,
      count: segmentCounts['general'] ?? 0,
    },
    {
      key: 'archived',
      label: 'Archived',
      icon: Archive,
      count: segmentCounts['archived'] ?? 0,
    },
  ];

  const renderItem = (item) => {
    const Icon = item.icon;
    const isSelected = !isOverview && currentSegment === item.key;
    const isAmber = item.isAmber && item.count > 0;

    return (
      <button
        key={item.key}
        onClick={() => handleSelectSegment(item.key)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4800] ${
          isSelected
            ? 'bg-[#fff4f0] dark:bg-orange-950/40 text-[#ff4800] font-bold shadow-xs border border-[#ffd4c4]/60 dark:border-orange-800/40'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isSelected
                ? 'text-[#ff4800]'
                : isAmber
                ? 'text-amber-600'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {item.count > 0 && (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
              isAmber
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-800/60'
                : isSelected
                ? 'bg-[#ff4800] text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            {item.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[calc(100vh-3.5rem)] select-none transition-colors">
      <div className="p-3.5 overflow-y-auto space-y-4">
        {/* Top-Level Navigation: Overview */}
        <div>
          <button
            onClick={handleSelectOverview}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4800] ${
              isOverview
                ? 'bg-[#fff4f0] dark:bg-orange-950/40 text-[#ff4800] font-bold shadow-xs border border-[#ffd4c4]/60 dark:border-orange-800/40'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard
                className={`w-4 h-4 shrink-0 ${isOverview ? 'text-[#ff4800]' : 'text-slate-400 dark:text-slate-500'}`}
              />
              <span className="font-semibold">Overview</span>
            </div>
          </button>
        </div>

        {/* Section 1: Who replies */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Who replies
          </div>
          {whoRepliesItems.map(renderItem)}
        </div>

        {/* Section 2: Follow-ups */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Follow-ups
          </div>
          {followUpItems.map(renderItem)}
        </div>

        {/* Section 3: More (Collapsible, collapsed by default, remembers state) */}
        <div className="space-y-1">
          <button
            onClick={toggleMore}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span>More</span>
            {moreOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            )}
          </button>

          {moreOpen && (
            <div className="space-y-1 pt-0.5">
              {moreItems.map(renderItem)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Workspace Links: Clean & Plain */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          onClick={() => setAccountsModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4800]"
        >
          <FolderSync className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Connected accounts</span>
        </button>

        {onOpenActivityModal && (
          <button
            onClick={onOpenActivityModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4800]"
          >
            <Activity className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Audit activity log</span>
          </button>
        )}
      </div>
    </aside>
  );
};
