import React, { useState } from 'react';
import {
  Star,
  Archive,
  MailCheck,
  CheckCircle,
  Clock,
  Calendar,
  Send,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import api from '../api/client';
import { useUIStore } from '../store/uiStore';

export const ConversationDetail = ({
  conversation,
  isLoading,
  onUpdateConversation,
  onArchive,
  onToggleStar,
  onToggleRead,
}) => {
  const { setMobilePane, addToast } = useUIStore();

  // Reply Composer State
  const [draftTone, setDraftTone] = useState('formal');
  const [drafting, setDrafting] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [rerunningAI, setRerunningAI] = useState(false);
  const [overrideDropdownOpen, setOverrideDropdownOpen] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 bg-surface p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#ff4800] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading thread...</span>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="hidden md:flex flex-1 bg-surface p-8 items-center justify-center text-center text-slate-400 select-none">
        <div className="max-w-xs space-y-2">
          <MailCheck className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
          <p className="text-xs font-medium text-slate-700">Select a conversation</p>
          <p className="text-[11px] text-slate-400">
            Use <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">j</kbd> and <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">k</kbd> to navigate.
          </p>
        </div>
      </div>
    );
  }

  const {
    _id,
    subject,
    participants = [],
    lastMessageAt,
    isImportant,
    isArchived,
    isCompleted,
    isRead,
    awaitingResponse,
    classification = {},
    summary,
    extracted = {},
    messages = [],
  } = conversation;

  const label = classification.label || 'No Reply Needed';
  const confidence = classification.confidence ?? 0.9;
  const isManual = classification.source === 'manual';
  const needsReview = classification.needsReview || confidence < 0.65;

  // Manual Override Action
  const handleOverrideClassification = async (newLabel) => {
    try {
      const res = await api.patch(`/conversations/${_id}/classification`, {
        label: newLabel,
        reason: `Manually set to ${newLabel}.`,
      });
      onUpdateConversation(res.data.data);
      setOverrideDropdownOpen(false);
      addToast({
        title: 'Classification Updated',
        message: `Set to "${newLabel}" (Manual override saved).`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Override Failed',
        message: err.response?.data?.message || 'Could not update classification',
        type: 'error',
      });
    }
  };

  // Re-run AI Action
  const handleRerunAI = async () => {
    setRerunningAI(true);
    try {
      const res = await api.post(`/conversations/${_id}/rerun-ai`);
      onUpdateConversation(res.data.data);
      addToast({
        title: 'Re-checked',
        message: `Updated: ${res.data.data.classification.label} (${(res.data.data.classification.confidence * 100).toFixed(0)}%)`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Re-run Failed',
        message: err.response?.data?.message || 'Classification service failed',
        type: 'error',
      });
    } finally {
      setRerunningAI(false);
    }
  };

  // Generate Draft Reply
  const handleGenerateDraft = async (tone) => {
    const selectedTone = tone || draftTone;
    setDraftTone(selectedTone);
    setDrafting(true);
    setComposerOpen(true);
    try {
      const res = await api.post(`/conversations/${_id}/draft-reply`, { tone: selectedTone });
      setReplyBody(res.data.data.body);
      addToast({
        title: 'Draft Generated',
        message: `Prepared response in ${selectedTone} tone. Review before sending.`,
        type: 'info',
      });
    } catch (err) {
      addToast({
        title: 'Drafting Error',
        message: err.response?.data?.message || 'Could not generate draft',
        type: 'error',
      });
    } finally {
      setDrafting(false);
    }
  };

  // Simulated Send Action (Explicit Review & Send step)
  const handleConfirmSend = async () => {
    setSending(true);
    try {
      const res = await api.post(`/conversations/${_id}/send-reply`, {
        body: replyBody,
        subject: `Re: ${subject}`,
        tone: draftTone,
      });

      onUpdateConversation(res.data.data.conversation);
      setReviewModalOpen(false);
      setComposerOpen(false);
      setReplyBody('');

      addToast({
        title: 'Reply Sent',
        message: 'Message added to thread. Status is now Waiting for response.',
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Send Error',
        message: err.response?.data?.message || 'Failed to send reply',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  // Mark Completed Action
  const handleMarkCompleted = async () => {
    try {
      const res = await api.patch(`/conversations/${_id}/complete`);
      onUpdateConversation(res.data.data);
      addToast({
        title: 'Marked Handled',
        message: 'Thread marked as resolved.',
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not mark complete', type: 'error' });
    }
  };

  // Sort messages newest first
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0)
  );

  const displayedMessages = showAllMessages || sortedMessages.length <= 2
    ? sortedMessages
    : sortedMessages.slice(0, 2);

  const hiddenCount = sortedMessages.length - 2;

  const dueDeadline = extracted.deadlines?.[0];
  const meetingInfo = extracted.meetings?.[0];

  return (
    <div className="flex-1 bg-surface flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-11 border-b border-border flex items-center justify-between px-5 bg-surface shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          {/* Mobile Back Button */}
          <button
            onClick={() => setMobilePane('list')}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleStar(_id)}
            className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${
              isImportant ? 'text-amber-500' : 'text-slate-400'
            }`}
            title="Star thread (s)"
          >
            <Star className={`w-3.5 h-3.5 ${isImportant ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onArchive(_id)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
            title="Archive conversation (e)"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleRead(_id)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
            title="Mark as unread (u)"
          >
            <MailCheck className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleMarkCompleted}
            disabled={isCompleted}
            className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${
              isCompleted ? 'text-teal-600' : 'text-slate-400 hover:text-teal-600'
            }`}
            title="Mark handled (d)"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-400 tabular-nums">
            {new Date(lastMessageAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/Los_Angeles',
            })}{' '}
            PST
          </span>
        </div>
      </div>

      {/* Main Reading & Thread View */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Email Header: Subject & Participants */}
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight leading-snug">
            {subject}
          </h1>

          <div className="flex items-center justify-between gap-2 mt-1 text-xs text-slate-500">
            <div>
              <span className="text-slate-800 font-medium">{participants[0]?.name || 'Unknown'}</span>{' '}
              <span className="text-slate-400">&lt;{participants[0]?.email}&gt;</span>
            </div>

            {awaitingResponse && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-800 border border-teal-200">
                <Clock className="w-2.5 h-2.5 text-teal-600" />
                <span>Waiting for reply</span>
              </span>
            )}
          </div>
        </div>

        {/* Unified "AI Summary" Card (Merged Responsibility, Why, Summary, and Due/Date line) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 p-4 space-y-2.5 text-xs">
          {/* Top Line: Responsibility chip with confidence + Actions aligned right */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  label === 'Client to Reply'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                    : label === 'Assistant to Reply'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {label}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isManual ? 'Set by you' : `${(confidence * 100).toFixed(0)}% confidence`}
              </span>
            </div>

            {/* Change and Re-check Actions Aligned Right */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleRerunAI}
                disabled={rerunningAI}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
                title="Re-evaluate with AI"
              >
                <RotateCcw className={`w-3 h-3 ${rerunningAI ? 'animate-spin' : ''}`} />
                <span>Re-check</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setOverrideDropdownOpen(!overrideDropdownOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
                >
                  <span>Change</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {overrideDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-hover py-1 z-30 text-xs">
                    <button
                      onClick={() => handleOverrideClassification('Assistant to Reply')}
                      className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Assistant to Reply
                    </button>
                    <button
                      onClick={() => handleOverrideClassification('Client to Reply')}
                      className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Client to Reply
                    </button>
                    <button
                      onClick={() => handleOverrideClassification('No Reply Needed')}
                      className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      No Reply Needed
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* One-Line "Why" Explanation */}
          <div className="text-xs text-slate-800 dark:text-slate-200">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Why: </span>
            <span>{classification.reason || 'Assigned based on stakeholder context.'}</span>
          </div>

          {/* 1-2 Sentence Summary */}
          {summary && (
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5 border-t border-slate-200/60 dark:border-slate-700/60">
              {summary}
            </div>
          )}

          {/* Due / Date Line if Present */}
          {dueDeadline && (
            <div className="text-xs font-semibold text-[#ff4800] flex items-center gap-1.5 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-[#ff4800] shrink-0" />
              <span>Due: {dueDeadline}</span>
            </div>
          )}

          {meetingInfo && (
            <div className="text-xs font-semibold text-[#ff4800] flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#ff4800] shrink-0" />
              <span>Meeting: {meetingInfo.title} • {meetingInfo.date} {meetingInfo.time}</span>
            </div>
          )}
        </div>

        {/* Thread History: Newest First */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Messages ({messages.length}) — Newest first</span>
          </div>

          {displayedMessages.map((msg, index) => {
            const isOutbound = msg.direction === 'outbound';
            return (
              <div
                key={msg._id || index}
                className={`p-4 rounded-lg border ${
                  isOutbound
                    ? 'bg-slate-50/50 border-slate-200'
                    : 'bg-surface border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-border-subtle text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {msg.from?.name || msg.from?.email}
                    </span>
                    {isOutbound && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700">
                        Outbound
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {new Date(msg.sentAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: 'America/Los_Angeles',
                    })}{' '}
                    PST
                  </span>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {msg.body}
                </div>
              </div>
            );
          })}

          {/* Collapsible Earlier Messages Button */}
          {sortedMessages.length > 2 && !showAllMessages && (
            <button
              onClick={() => setShowAllMessages(true)}
              className="w-full py-2 rounded border border-dashed border-slate-300 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Show {hiddenCount} earlier messages</span>
            </button>
          )}

          {sortedMessages.length > 2 && showAllMessages && (
            <button
              onClick={() => setShowAllMessages(false)}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Collapse earlier messages</span>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Reply Bar at the Bottom */}
      <div className="shrink-0 border-t border-border bg-surface px-5 py-3 select-none">
        {!composerOpen ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateDraft(draftTone)}
                disabled={drafting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold transition-all shadow-[0_4px_14px_rgba(255,72,0,0.3)] disabled:opacity-50"
                title="Draft reply using AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-100" />
                <span>{drafting ? 'Drafting...' : 'Draft with AI'}</span>
              </button>

              {/* Tone Selector */}
              <div className="inline-flex items-center p-0.5 rounded-full border border-slate-200 bg-slate-50">
                {['formal', 'friendly', 'brief'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => {
                      setDraftTone(tone);
                      handleGenerateDraft(tone);
                    }}
                    disabled={drafting}
                    className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                      draftTone === tone
                        ? 'bg-white text-[#ff4800] font-bold shadow-xs border border-orange-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setComposerOpen(true)}
              className="px-3.5 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              title="Open reply composer"
            >
              <Send className="w-3 h-3 text-slate-400" />
              <span>Write reply</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
              <span className="text-xs font-semibold text-slate-900">
                Reply composer
              </span>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 mr-1">Tone:</span>
                {['formal', 'friendly', 'brief'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => handleGenerateDraft(tone)}
                    disabled={drafting}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] capitalize border transition-colors ${
                      draftTone === tone
                        ? 'bg-[#ff4800] text-white border-[#ff4800] font-semibold'
                        : 'bg-surface text-slate-600 border-border hover:bg-slate-50'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {drafting && (
              <div className="flex items-center gap-2 text-xs text-slate-600 py-1">
                <div className="w-3 h-3 border-2 border-[#ff4800] border-t-transparent rounded-full animate-spin" />
                <span>Drafting response in {draftTone} tone...</span>
              </div>
            )}

            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write or edit your response here..."
              rows={4}
              className="w-full text-xs font-sans p-3 bg-surface border border-slate-200 focus:border-[#ff4800] rounded-xl outline-none resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={() => setComposerOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg"
              >
                Close
              </button>

              <button
                onClick={() => setReviewModalOpen(true)}
                disabled={!replyBody.trim()}
                className="px-4 py-2 rounded-xl bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(255,72,0,0.3)] inline-flex items-center gap-1.5"
                title="Review message before send"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Review & Send</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review & Send Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-slate-100 rounded-2xl shadow-hover max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#ff4800]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Review Outbound Message
                </h3>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex gap-2 text-slate-500">
                <span className="font-semibold text-slate-700 w-16">To:</span>
                <span>{participants[0]?.name} &lt;{participants[0]?.email}&gt;</span>
              </div>
              <div className="flex gap-2 text-slate-500">
                <span className="font-semibold text-slate-700 w-16">Subject:</span>
                <span>Re: {subject}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
              {replyBody}
            </div>

            <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600">
              Sending will append this message to the thread and update the status to <em>Waiting for response</em>.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                Back to edit
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={sending}
                className="px-4 py-2 rounded-xl bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(255,72,0,0.3)] flex items-center gap-1.5"
              >
                {sending ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve & Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
