import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Calendar,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../api/client';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ChatSidePanel } from '../components/ChatSidePanel';
import { AccountsModal } from '../components/AccountsModal';
import { SimulateEmailModal } from '../components/SimulateEmailModal';
import { KeyboardHelpModal } from '../components/KeyboardHelpModal';
import { ActivityLogsModal } from '../components/ActivityLogsModal';
import { ToastContainer } from '../components/ToastContainer';
import { useUIStore } from '../store/uiStore';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const {
    setActiveSegment,
    setActiveConversationId,
    mobilePane,
  } = useUIStore();

  const [activityModalOpen, setActivityModalOpen] = useState(false);

  React.useEffect(() => {
    document.title = 'Ownly · Overview';
  }, []);

  // Fetch Dashboard Stats & Overview Data
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data;
    },
    refetchInterval: 15000,
  });

  // Fetch conversations to find items due today
  const { data: convData } = useQuery({
    queryKey: ['overviewDueToday'],
    queryFn: async () => {
      const res = await api.get('/conversations?limit=45');
      return res.data?.data?.conversations || [];
    },
    staleTime: 30000,
  });

  const stats = statsData?.stats || {};
  const upcomingMeetings = statsData?.upcomingMeetings || [];
  const needsReviewItems = statsData?.needsReviewItems || [];

  // Filter items due today
  const conversations = convData || [];
  const todayItems = conversations.filter((c) => {
    const d = c.extracted?.deadlines?.[0];
    if (!d) return false;
    const nowPSTStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    });
    return d.toLowerCase().includes('today') || d.includes(nowPSTStr);
  });

  const handleNavigateSegment = (segmentKey) => {
    setActiveSegment(segmentKey);
    navigate(`/dashboard?segment=${segmentKey}`);
  };

  const handleOpenConversation = (conversationId, segmentKey = 'all') => {
    setActiveSegment(segmentKey);
    setActiveConversationId(conversationId);
    navigate(`/dashboard?segment=${segmentKey}`);
  };

  // Exactly 4 Headline Cards (Payoneer Financial Module Design)
  const headlineCards = [
    {
      title: 'Needs your reply',
      value: stats.assignedToAssistant ?? 0,
      description: 'Pending assistant action',
      segment: 'assistant-to-reply',
      icon: UserCheck,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'Assistant',
    },
    {
      title: 'Client to reply',
      value: stats.needsClient ?? 0,
      description: 'Principal decision needed',
      segment: 'client-to-reply',
      icon: ShieldAlert,
      iconColor: 'text-[#ff4800]',
      bgColor: 'bg-[#fff4f0]',
      badge: 'Client',
    },
    {
      title: 'Awaiting response',
      value: stats.awaitingResponse ?? 0,
      description: 'Sent, waiting for a reply',
      segment: 'waiting-for-response',
      icon: Clock,
      iconColor: 'text-slate-700',
      bgColor: 'bg-slate-100',
      badge: 'Waiting',
    },
    {
      title: 'Needs review',
      value: stats.needsReview ?? 0,
      description: 'Low-confidence, please check',
      segment: 'needs-review',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      highlight: true,
      badge: 'Attention',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex flex-col overflow-hidden transition-colors">
      {/* Top Navbar */}
      <Navbar aiStatus={statsData?.aiStatus} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`${
            mobilePane === 'sidebar' ? 'block absolute inset-0 z-30' : 'hidden md:block'
          }`}
        >
          <Sidebar
            segmentCounts={statsData?.segments || {}}
            onOpenActivityModal={() => setActivityModalOpen(true)}
          />
        </div>

        {/* Overview Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#0b0f19] p-6 lg:p-8 space-y-6 transition-colors">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Workspace Overview
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                What needs attention today
              </p>
            </div>

            <button
              onClick={() => handleNavigateSegment('assistant-to-reply')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold transition-all shadow-[0_4px_14px_rgba(255,72,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,72,0,0.4)] self-start sm:self-auto group"
            >
              <span>Open inbox</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 4 Headline Cards (Payoneer Financial Metric Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {headlineCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  onClick={() => handleNavigateSegment(card.segment)}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer group relative overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 ${
                    card.highlight
                      ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50/10 dark:bg-amber-950/20'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {card.title}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-xs ${card.bgColor} dark:bg-slate-800`}
                    >
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>

                  <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tabular-nums tracking-tight mt-3">
                    {isLoading ? '-' : card.value}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                      {card.description}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#ff4800] transition-colors shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today Strip: items due today */}
          {todayItems.length > 0 && (
            <div className="rounded-3xl border border-orange-200/80 dark:border-orange-900/50 bg-gradient-to-r from-orange-50/70 dark:from-orange-950/40 via-white dark:via-slate-900 to-orange-50/40 dark:to-orange-950/20 p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4800] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff4800]" />
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Due Today ({todayItems.length})
                  </span>
                </div>
                <span className="text-xs text-[#ff4800] font-semibold">
                  Priority follow-ups
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {todayItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleOpenConversation(item._id)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 hover:border-orange-300 dark:hover:border-orange-600 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-xs hover:shadow-soft"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                        {item.subject}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5 font-medium">
                        {item.participants?.[0]?.name || 'Sender'}
                      </span>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {item.extracted?.deadlines?.[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clean Two-Column Layout: Upcoming Meetings & Needs Review */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Upcoming Meetings */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Upcoming Meetings
                      </h2>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        Extracted from inbox correspondence
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigateSegment('meetings-appointments')}
                    className="text-xs text-[#ff4800] hover:text-[#ea3e00] inline-flex items-center gap-1 font-semibold transition-colors"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {upcomingMeetings.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No upcoming meetings currently detected.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingMeetings.map((m, idx) => (
                      <div
                        key={`m-${idx}`}
                        onClick={() => handleOpenConversation(m.conversationId, 'meetings-appointments')}
                        className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#ff4800] transition-colors truncate">
                              {m.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {m.person}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            {m.subject}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                            {m.date}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums font-medium">
                            {m.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-between">
                <span>Synchronized with calendar extraction</span>
                <span className="tabular-nums font-semibold text-slate-600 dark:text-slate-300">{upcomingMeetings.length} commitments</span>
              </div>
            </div>

            {/* Right Column: Needs Review Shortcut List (Top 5) */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Needs Review
                      </h2>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        Ambiguous or low-confidence triage
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigateSegment('needs-review')}
                    className="text-xs text-[#ff4800] hover:text-[#ea3e00] inline-flex items-center gap-1 font-semibold transition-colors"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {needsReviewItems.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    <span>All triage classifications verified. No items pending review.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {needsReviewItems.map((item) => (
                      <div
                        key={item.conversationId}
                        onClick={() => handleOpenConversation(item.conversationId, 'needs-review')}
                        className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/80 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors truncate">
                              {item.subject}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 shrink-0 tabular-nums">
                              {(item.confidence * 100).toFixed(0)}%
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            {item.reason}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-600 shrink-0 self-center transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-between">
                <span>Confidence boundary &lt; 65%</span>
                <span className="tabular-nums font-semibold text-slate-600 dark:text-slate-300">{needsReviewItems.length} in queue</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Slide-out Ask AI Chat */}
      <ChatSidePanel />

      {/* Modals */}
      <AccountsModal />
      <SimulateEmailModal />
      <KeyboardHelpModal />
      <ActivityLogsModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};
