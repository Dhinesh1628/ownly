import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCards } from '../components/StatsCards';
import { MeetingsCard } from '../components/MeetingsCard';
import { ConversationList } from '../components/ConversationList';
import { ConversationDetail } from '../components/ConversationDetail';
import { ChatSidePanel } from '../components/ChatSidePanel';
import { AccountsModal } from '../components/AccountsModal';
import { SimulateEmailModal } from '../components/SimulateEmailModal';
import { KeyboardHelpModal } from '../components/KeyboardHelpModal';
import { ActivityLogsModal } from '../components/ActivityLogsModal';
import { ToastContainer } from '../components/ToastContainer';
import { useUIStore } from '../store/uiStore';

export const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const {
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    filterUnreadOnly,
    filterImportantOnly,
    mobilePane,
    setMobilePane,
    addToast,
  } = useUIStore();

  const [showStatsOverview, setShowStatsOverview] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Ownly · Inbox';
  }, []);

  const segment = searchParams.get('segment') || 'assistant-to-reply';
  const search = searchParams.get('search') || '';

  // 1. Fetch Dashboard Stats & Segments Live Counts
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data;
    },
    refetchInterval: 15000, // Poll every 15s to keep live sync
  });

  // 2. Fetch Conversations Stream based on Segment and Filters
  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: [
      'conversations',
      segment,
      search,
      filterUnreadOnly,
      filterImportantOnly,
    ],
    queryFn: async () => {
      const params = { segment };
      if (search) params.search = search;
      if (filterUnreadOnly) params.isRead = 'false';
      if (filterImportantOnly) params.isImportant = 'true';

      const res = await api.get('/conversations', { params });
      return res.data;
    },
  });

  const conversations = conversationsData?.data || [];

  // Default select first conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && window.innerWidth >= 768) {
      setActiveConversationId(conversations[0]._id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  // 3. Fetch Selected Active Conversation Details
  const { data: activeConvData, isLoading: isActiveConvLoading } = useQuery({
    queryKey: ['conversation', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      const res = await api.get(`/conversations/${activeConversationId}`);
      return res.data.data;
    },
    enabled: Boolean(activeConversationId),
  });

  // Action: Toggle Star / Important
  const handleToggleStar = async (convId) => {
    try {
      await api.patch(`/conversations/${convId}/star`);
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['dashboardStats']);
      queryClient.invalidateQueries(['conversation', convId]);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update star', type: 'error' });
    }
  };

  // Action: Archive with Undo Toast
  const handleArchive = async (convId) => {
    try {
      await api.patch(`/conversations/${convId}/archive`);
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['dashboardStats']);

      // Auto select next conversation
      const remaining = conversations.filter((c) => c._id !== convId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0]._id);
      } else {
        setActiveConversationId(null);
      }

      addToast({
        title: 'Conversation Archived',
        message: 'The email thread has been moved to Archive.',
        type: 'info',
        onUndo: async () => {
          await api.patch(`/conversations/${convId}/archive`);
          queryClient.invalidateQueries(['conversations']);
          queryClient.invalidateQueries(['dashboardStats']);
          setActiveConversationId(convId);
        },
      });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to archive', type: 'error' });
    }
  };

  // Action: Toggle Read/Unread
  const handleToggleRead = async (convId) => {
    try {
      await api.patch(`/conversations/${convId}/read`);
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['dashboardStats']);
      queryClient.invalidateQueries(['conversation', convId]);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to toggle read status', type: 'error' });
    }
  };

  // Action: Handle manual override or update in ConversationDetail
  const handleUpdateConversation = (updatedConv) => {
    queryClient.setQueryData(['conversation', updatedConv._id], updatedConv);
    queryClient.invalidateQueries(['conversations']);
    queryClient.invalidateQueries(['dashboardStats']);
  };

  // Action: Callback after simulation
  const handleEmailSimulated = (simulatedConv) => {
    queryClient.invalidateQueries(['conversations']);
    queryClient.invalidateQueries(['dashboardStats']);
    setActiveConversationId(simulatedConv._id);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <Navbar aiStatus={statsData?.aiStatus} />

      {/* Main 3-Pane Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Pane 1: Sidebar (Desktop always visible, Mobile conditionally drawer) */}
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

        {/* Pane 2: Conversation List Stream */}
        <div
          className={`flex-1 md:flex-initial flex flex-col ${
            mobilePane === 'list' ? 'block' : 'hidden md:flex'
          }`}
        >
          <ConversationList
            conversations={conversations}
            isLoading={isConversationsLoading}
            total={conversationsData?.total || 0}
            onToggleStar={handleToggleStar}
            onArchive={handleArchive}
            onRefetch={() => {
              refetchConversations();
              refetchStats();
            }}
          />
        </div>

        {/* Pane 3: Conversation Detail & Thread History */}
        <div
          className={`flex-1 flex flex-col bg-surface min-w-0 ${
            mobilePane === 'detail' ? 'block' : 'hidden md:flex'
          }`}
        >
          <ConversationDetail
            conversation={activeConvData}
            isLoading={isActiveConvLoading}
            onUpdateConversation={handleUpdateConversation}
            onArchive={handleArchive}
            onToggleStar={handleToggleStar}
            onToggleRead={handleToggleRead}
          />
        </div>

        {/* AI Chat Drawer Panel */}
        <ChatSidePanel />
      </div>

      {/* Modals & Dialogs */}
      <AccountsModal
        onAccountsChanged={() => {
          refetchConversations();
          refetchStats();
        }}
      />
      <SimulateEmailModal
        currentConversation={activeConvData}
        onEmailSimulated={handleEmailSimulated}
      />
      <KeyboardHelpModal />
      <ActivityLogsModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};
