import React, { useState } from 'react';
import { Send, X, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { useUIStore } from '../store/uiStore';

export const SimulateEmailModal = ({ currentConversation, onEmailSimulated }) => {
  const { simulateModalOpen, setSimulateModalOpen, addToast } = useUIStore();

  const [senderName, setSenderName] = useState('Marcus Vance');
  const [senderEmail, setSenderEmail] = useState('marcus@vancecap.com');
  const [subject, setSubject] = useState(
    currentConversation ? `Re: ${currentConversation.subject}` : 'Urgent: Board Resolution on Series A Allocation'
  );
  const [body, setBody] = useState(
    'Hi Alex, we need your personal signoff on the revised indemnity clause before Fri, Nov 20, 5:00 PM PST. Please let me know once signed.'
  );
  const [targetMode, setTargetMode] = useState(currentConversation ? 'current' : 'new');
  const [loading, setLoading] = useState(false);

  if (!simulateModalOpen) return null;

  const samplePresets = [
    {
      title: 'High Stakes (Client to Reply)',
      senderName: 'Marcus Vance',
      senderEmail: 'marcus@vancecap.com',
      body: 'Hi Alex, we need your direct personal founder authorization on the $28M term sheet allocation by Fri, Nov 20, 5:00 PM PST.',
      subject: 'Term Sheet Review & Final Valuation Signoff',
    },
    {
      title: 'Administrative (Assistant to Reply)',
      senderName: 'Elena Rostova',
      senderEmail: 'elena@stridegrowth.io',
      body: 'Can we move our Thursday strategy sync to Friday anytime between 10 AM and 1 PM PST? Please have your assistant confirm the Zoom link.',
      subject: 'Rescheduling Q4 Strategy Sync',
    },
    {
      title: 'Ambiguous (<0.65 Needs Review)',
      senderName: 'Julian Thorne',
      senderEmail: 'julian@craftpointvc.com',
      body: 'Passing this along. Seed stage team doing automated supply chain triage. Let me know what you think when you have a minute. Could go either way.',
      subject: 'FWD: interesting synergy proposal - thoughts?',
    },
    {
      title: 'Newsletter (No Reply Needed)',
      senderName: 'Tech Curated',
      senderEmail: 'digest@techcurated.com',
      body: 'Here is your weekly digest of artificial intelligence architecture, new LLM benchmarks, and research papers.',
      subject: 'Tech Curated: Weekly Model Briefing & Benchmarks',
    },
  ];

  const handleApplyPreset = (preset) => {
    setSenderName(preset.senderName);
    setSenderEmail(preset.senderEmail);
    setBody(preset.body);
    setSubject(targetMode === 'current' && currentConversation ? `Re: ${currentConversation.subject}` : preset.subject);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        senderName,
        senderEmail,
        subject,
        body,
        conversationId: targetMode === 'current' && currentConversation ? currentConversation._id : null,
      };

      const res = await api.post('/simulate/incoming-email', payload);

      setSimulateModalOpen(false);
      onEmailSimulated && onEmailSimulated(res.data.data.conversation);

      addToast({
        title: 'Incoming Email Simulated!',
        message: `Thread reclassified as "${res.data.data.conversation.classification.label}" with ${(res.data.data.conversation.classification.confidence * 100).toFixed(0)}% confidence.`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Simulation Error',
        message: err.response?.data?.message || 'Failed to simulate email',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-slate-100 rounded-3xl shadow-hover max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-[#ff4800]" />
            <h3 className="text-sm font-bold text-slate-900">
              Simulate Live Inbound Email
            </h3>
          </div>
          <button
            onClick={() => setSimulateModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Inject a new message into an active thread or create a new conversation to observe the real-time AI classification engine and thread re-evaluation.
        </p>

        {/* Target Selector */}
        {currentConversation && (
          <div className="flex items-center gap-3 text-xs bg-surface-subtle p-2 rounded border border-border-subtle">
            <span className="font-medium text-slate-700">Target:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="targetMode"
                value="current"
                checked={targetMode === 'current'}
                onChange={() => setTargetMode('current')}
                className="text-accent focus:ring-accent"
              />
              <span>Append to Current Thread</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="targetMode"
                value="new"
                checked={targetMode === 'new'}
                onChange={() => setTargetMode('new')}
                className="text-accent focus:ring-accent"
              />
              <span>Brand New Thread</span>
            </label>
          </div>
        )}

        {/* Preset Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
            Triage Scenario Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2 py-1 rounded bg-surface-subtle hover:bg-surface-hover border border-border text-[11px] text-slate-700 transition-colors"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Sender Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
                className="w-full p-2 bg-surface border border-border rounded text-xs focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Sender Email
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
                className="w-full p-2 bg-surface border border-border rounded text-xs focus:border-accent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full p-2 bg-surface border border-border rounded text-xs focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              required
              className="w-full p-2 bg-surface border border-border rounded text-xs focus:border-accent outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSimulateModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#ff4800] hover:bg-[#ea3e00] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(255,72,0,0.3)] flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Classifying...' : 'Simulate & Reclassify'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
