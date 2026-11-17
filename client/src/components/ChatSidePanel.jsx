import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  X,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '../api/client';
import { useUIStore } from '../store/uiStore';

export const ChatSidePanel = () => {
  const {
    chatOpen,
    setChatOpen,
    activeConversationId,
    setActiveConversationId,
  } = useUIStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello. I can assist you with active conversations, pending actions, who is waiting on a reply, or drafting a response.',
      suggestedActions: [
        'Show me emails that need my attention',
        'What am I waiting for a response on?',
        'Which emails require the client\'s attention?',
      ],
    },
  ]);

  if (!chatOpen) return null;

  const presetQueries = [
    'Show me emails that need my attention',
    'Summarize this conversation',
    'What am I waiting for a response on?',
    'Which emails require the client\'s attention?',
    'Why has this email been assigned to the client?',
    'Draft a reply to this conversation',
  ];

  const handleSend = async (queryText) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/query', {
        query: q,
        activeConversationId,
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.data.data.answer,
        suggestedActions: res.data.data.suggestedActions || [],
        references: res.data.data.referencedConversationIds || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error querying the inbox. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Render markdown links like [Subject](conversation:ID) into clickable interactive elements
  const renderMessageContent = (content) => {
    // Regex matches [Link Text](conversation:ID)
    const regex = /\[(.*?)\]\(conversation:(.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const title = match[1];
      const convId = match[2];
      parts.push(
        <button
          key={`link-${match.index}`}
          onClick={() => setActiveConversationId(convId)}
          className="inline-flex items-center gap-1 font-semibold text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          <span>{title}</span>
          <ExternalLink className="w-2.5 h-2.5 inline" />
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-surface border-l border-border shadow-card flex flex-col justify-between">
      {/* Drawer Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-surface select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent-light text-accent flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900">Inbox Assistant</h3>
            <p className="text-[10px] text-slate-400">Grounded Database Context</p>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-surface-subtle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex gap-2.5 ${isAssistant ? 'items-start' : 'items-start justify-end'}`}
            >
              {isAssistant && (
                <div className="w-6 h-6 rounded bg-surface-subtle text-slate-700 border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3 h-3" />
                </div>
              )}

              <div
                className={`p-3 rounded max-w-[85%] leading-relaxed ${
                  isAssistant
                    ? 'bg-surface-subtle border border-border-subtle text-slate-800'
                    : 'bg-primary text-white font-medium'
                }`}
              >
                <div className="whitespace-pre-line">
                  {renderMessageContent(msg.content)}
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions?.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border-subtle/80 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(action)}
                        className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border text-[10px] text-slate-700 transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  U
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
            <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
            <span>Scanning inbox context...</span>
          </div>
        )}
      </div>

      {/* Preset Suggestions Bar */}
      <div className="px-3 py-2 border-t border-border-subtle bg-surface-subtle/40 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
        {presetQueries.map((query, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(query)}
            className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-border text-[10px] text-slate-600 transition-colors"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Query Input Bar */}
      <div className="p-3 border-t border-border bg-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about emails, summaries, or drafts..."
            className="w-full text-xs bg-surface-subtle focus:bg-surface border border-border focus:border-accent rounded pl-3 pr-9 py-2 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-1 rounded bg-accent hover:bg-accent-hover text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
