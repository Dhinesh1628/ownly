import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { ClientView } from '../components/ClientView';
import { ToastContainer } from '../components/ToastContainer';

export const ClientPage = () => {
  React.useEffect(() => {
    document.title = 'Needs your reply · Ownly';
  }, []);
  const {
    data: clientConversationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['clientConversations'],
    queryFn: async () => {
      // Query specifically for Client to Reply threads
      const res = await api.get('/conversations', {
        params: {
          segment: 'client-to-reply',
          isArchived: 'false',
          isCompleted: 'false',
        },
      });
      return res.data;
    },
    refetchInterval: 10000, // 10s live sync with assistant changes
  });

  const conversations = clientConversationsData?.data || [];

  return (
    <>
      <ClientView
        conversations={conversations}
        isLoading={isLoading}
        onRefresh={refetch}
      />
      <ToastContainer />
    </>
  );
};
