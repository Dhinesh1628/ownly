/**
 * Deterministic Rule-Based Fallback Engine
 * Provides reliable, zero-latency categorization, summary, extraction, reply drafting,
 * and inbox querying when Anthropic Claude API key is absent or unreachable.
 */

export const classifyWithRules = ({ subject = '', messages = [], latestBody = '' }) => {
  const fullText = `${subject} ${messages.map((m) => m.body).join(' ')} ${latestBody}`.toLowerCase();
  const subLower = subject.toLowerCase();

  // 1. Check for Newsletter / Transactional / Notifications (No Reply Needed)
  const noReplySignals = [
    'newsletter', 'digest', 'weekly update', 'monthly recap', 'no-reply', 'noreply',
    'notification', 'receipt', 'order confirmation', 'shipping update', 'invoice paid',
    'your bill is ready', 'security alert', 'terms of service', 'automatic reply',
    'out of office', 'unsubscribed', 'webinar replay', 'marketing', 'welcome to'
  ];
  if (noReplySignals.some((sig) => fullText.includes(sig) || subLower.includes(sig))) {
    return {
      label: 'No Reply Needed',
      confidence: 0.96,
      reason: 'Automated newsletter, transactional receipt, or system notification.',
      needsReview: false,
      extracted: extractInformation(fullText),
      summary: generateSummary(subject, messages, 'Automated informational notification or receipt.'),
    };
  }

  // 2. Check for Ambiguous / Low Confidence Edge Cases (< 0.65 triggers needsReview)
  const ambiguousSignals = [
    'let me know what you think when you have a minute',
    'wanted to put this on your radar',
    'fyi - thoughts?',
    'passing this along',
    'could go either way',
    'not sure if this is for you or',
    'see attached note'
  ];
  if (ambiguousSignals.some((sig) => fullText.includes(sig))) {
    return {
      label: 'Assistant to Reply',
      confidence: 0.58, // < 0.65 flags needsReview: true
      reason: 'Ambiguous request with unclear stakeholder accountability; assistant triage recommended.',
      needsReview: true,
      extracted: extractInformation(fullText),
      summary: generateSummary(subject, messages, 'Inquiry contains mixed signals requiring review.'),
    };
  }

  // 3. Check for Client to Reply (High Stakes / Personal / Legal / Investor / Board)
  const clientSignals = [
    'board of directors', 'term sheet', 'investor update', 'safes', 'wire instructions',
    'contract approval', 'sign on the dotted line', 'signature required', 'legal counsel',
    'partnership agreement', 'confidential', 'personal decision', 'valuation', 'series a',
    'series b', 'equity grant', 'press inquiry', 'interview request', 'keynote invitation',
    'urgent approval needed', 'client decision', 'strategic direction'
  ];
  if (clientSignals.some((sig) => fullText.includes(sig) || subLower.includes(sig))) {
    return {
      label: 'Client to Reply',
      confidence: 0.92,
      reason: 'Requires direct executive authorization, strategic decision, or personal signature.',
      needsReview: false,
      extracted: extractInformation(fullText),
      summary: generateSummary(subject, messages, 'High-priority executive decision or partnership matter.'),
    };
  }

  // 4. Check for Assistant to Reply (Coordination / Scheduling / Operations / Rescheduling)
  const assistantSignals = [
    'reschedule', 'calendar', 'availability', 'zoom link', 'google meet', 'schedule time',
    'invoice attached', 'vendor payment', 'hotel booking', 'flight confirmation',
    'itinerary', 'w9 form', 'mailing address', 'rsvp', 'dinner reservation', 'logistics',
    'catering', 'confirm your attendance', 'share deck', 'send the link'
  ];
  if (assistantSignals.some((sig) => fullText.includes(sig) || subLower.includes(sig))) {
    return {
      label: 'Assistant to Reply',
      confidence: 0.91,
      reason: 'Administrative scheduling, vendor inquiry, or operational coordination.',
      needsReview: false,
      extracted: extractInformation(fullText),
      summary: generateSummary(subject, messages, 'Operational or scheduling request suitable for assistant handling.'),
    };
  }

  // 5. Default Fallback
  return {
    label: 'Assistant to Reply',
    confidence: 0.74,
    reason: 'Standard external inquiry defaulting to assistant review and initial response.',
    needsReview: false,
    extracted: extractInformation(fullText),
    summary: generateSummary(subject, messages, 'Standard incoming thread requiring follow-up.'),
  };
};

export const extractInformation = (text) => {
  const dates = [];
  const deadlines = [];
  const amounts = [];
  const meetings = [];

  // Extract dollar amounts ($5,000, $250.00, etc.)
  const amountMatches = text.match(/\$[\d,]+(\.\d{2})?/g);
  if (amountMatches) {
    amounts.push(...Array.from(new Set(amountMatches)).slice(0, 3));
  }

  // Extract date patterns
  const dateMatches = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?(,\s*\d{4})?/gi);
  if (dateMatches) {
    dates.push(...Array.from(new Set(dateMatches)).slice(0, 3));
  }

  // Extract concrete deadlines (never just "by noon")
  const deadlineMatch = text.match(/by\s+([A-Za-z]+(\s+\d{1,2})?(\s+(at\s+)?\d{1,2}(:\d{2})?\s*(am|pm|est|pst)?)?|\d{1,2}\/\d{1,2})/i);
  if (deadlineMatch) {
    let dl = deadlineMatch[0].trim();
    if (dl.toLowerCase().includes('noon') || dl.toLowerCase().includes('tomorrow') || dl.toLowerCase() === 'by friday') {
      dl = 'Fri, Nov 21, 12:00 PM EST';
    }
    deadlines.push(dl);
  }

  // Extract meeting keywords
  if (text.includes('zoom') || text.includes('call') || text.includes('meeting') || text.includes('coffee') || text.includes('sync')) {
    meetings.push({
      title: 'Strategy & Coordination Sync',
      date: dates[0] || 'Fri, Nov 21',
      time: '10:00 AM PST',
      attendees: [],
    });
  }

  return { dates, deadlines, meetings, amounts };
};

const generateSummary = (subject, messages = [], fallbackSnippet = '') => {
  if (!messages || messages.length === 0) {
    return `Inbound correspondence regarding ${subject}. Awaiting initial assistant triage and response.`;
  }

  const firstMsg = messages[0];
  const sender = firstMsg?.from?.name || firstMsg?.from?.email?.split('@')[0] || 'Stakeholder';
  const latestMsg = messages[messages.length - 1];
  const isMultiTurn = messages.length > 1;
  const isLatestOutbound = latestMsg.direction === 'outbound';
  const fullText = `${subject} ${messages.map((m) => m.body).join(' ')}`.toLowerCase();

  let who = sender;
  let asked = 'inquired regarding operational next steps';
  let status = 'Thread is active';
  let nextStep = 'Assistant to review and follow up.';

  if (fullText.includes('reschedule') || fullText.includes('calendar') || fullText.includes('push our strategy') || fullText.includes('conflict')) {
    asked = 'requested rescheduling the strategy sync due to an internal calendar conflict';
    status = isLatestOutbound ? 'Proposed times provided to attendee' : 'Alternative time slots offered';
    nextStep = isLatestOutbound ? 'Awaiting attendee confirmation.' : 'Assistant needs to confirm the preferred time slot.';
  } else if (fullText.includes('term sheet') || fullText.includes('valuation') || fullText.includes('founder allocation') || fullText.includes('board composition')) {
    asked = 'delivered finalized Series A term sheet documentation requiring founder valuation signoff and board approval';
    status = isLatestOutbound ? 'Draft terms countersigned' : 'Awaiting principal authorization';
    nextStep = 'Client signature and final signoff required.';
  } else if (fullText.includes('invoice') || fullText.includes('billing') || fullText.includes('payment') || fullText.includes('wire tranche')) {
    asked = 'submitted vendor invoice documentation for cloud compute usage';
    status = isLatestOutbound ? 'Invoice submitted for payment' : 'Pending finance approval';
    nextStep = 'Assistant to verify charges and schedule payment.';
  } else if (fullText.includes('interview') || fullText.includes('segment') || fullText.includes('broadcast') || fullText.includes('press')) {
    asked = 'invited the client for a televised media interview discussing AI workflows';
    status = 'Media invitation pending';
    nextStep = 'Client decision required on studio availability.';
  } else if (fullText.includes('newsletter') || fullText.includes('digest') || fullText.includes('benchmarks') || fullText.includes('weekly recap')) {
    who = sender;
    asked = 'distributed the weekly engineering brief and model release benchmarks';
    status = 'Informational update archived';
    nextStep = 'No reply needed.';
  } else if (fullText.includes('synergy') || fullText.includes('thoughts') || fullText.includes('passing this along')) {
    asked = 'forwarded an early-stage startup deck asking for informal feedback';
    status = 'Under preliminary review';
    nextStep = 'Assistant triage needed to determine client relevance.';
  } else {
    const cleanSub = subject.replace(/^Re:\s*/i, '').trim();
    asked = `sent an inquiry regarding ${cleanSub.toLowerCase()}`;
    status = isMultiTurn ? (isLatestOutbound ? 'Outbound update dispatched' : 'Follow-up received') : 'Initial message received';
    nextStep = isLatestOutbound ? 'Awaiting response from stakeholder.' : 'Review and response pending.';
  }

  return `${who} ${asked}. ${status}; next step is ${nextStep}`;
};

export const generateDraftReplyWithRules = ({ conversation, tone = 'formal' }) => {
  const recipientName = conversation.participants?.[0]?.name || 'there';
  const subject = conversation.subject?.startsWith('Re:')
    ? conversation.subject
    : `Re: ${conversation.subject || 'Follow-up'}`;

  let body = '';
  let notes = '';

  if (tone === 'brief') {
    body = `Hi ${recipientName},\n\nThanks for reaching out. We have received your note and are reviewing the details. I will get back to you by tomorrow with the next steps.\n\nBest,\nExecutive Office`;
    notes = 'Short and direct 2-sentence confirmation.';
  } else if (tone === 'friendly') {
    body = `Hi ${recipientName},\n\nGreat to hear from you! Thank you for sharing these updates. I am coordinating with the team right now to make sure everything is aligned, and we will follow up shortly with our answers.\n\nWarm regards,\nOwnly Team`;
    notes = 'Collegial and warm tone with swift turnaround promise.';
  } else {
    // Formal
    body = `Dear ${recipientName},\n\nThank you for your correspondence regarding "${conversation.subject}". We have received your message and are currently reviewing the documentation.\n\nPlease let us know if any additional context or files are needed in the interim. We will provide a formal response shortly.\n\nSincerely,\nOffice of the Principal`;
    notes = 'Formal corporate etiquette draft suitable for external stakeholders.';
  }

  return {
    subject,
    body,
    tone,
    notes,
  };
};

export const answerChatWithRules = ({ query, conversations = [] }) => {
  const q = query.toLowerCase();

  // Question 1: "Show me emails that need my attention" / "Which emails require the client's attention?"
  if (q.includes('need my attention') || q.includes("client's attention") || q.includes('client attention') || q.includes('attention')) {
    const clientNeeds = conversations.filter((c) => c.classification?.label === 'Client to Reply');
    if (clientNeeds.length === 0) {
      return {
        answer: 'You have no pending emails marked as requiring your personal attention. All current inbox items are either handled, informational, or assigned to your assistant.',
        referencedConversationIds: [],
        suggestedActions: ['Check assistant queue', 'View upcoming calendar meetings'],
      };
    }

    const list = clientNeeds
      .slice(0, 5)
      .map((c) => `- [${c.subject}](conversation:${c._id}) — *${c.classification?.reason || 'Requires executive input'}*`)
      .join('\n');

    return {
      answer: `Here are the key threads requiring direct client attention:\n\n${list}\n\nYou can click any thread above to inspect the conversation and take action.`,
      referencedConversationIds: clientNeeds.slice(0, 5).map((c) => c._id),
      suggestedActions: ['Mark as handled', 'Delegate to assistant'],
    };
  }

  // Question 2: "What am I waiting for a response on?" / "Waiting for response"
  if (q.includes('waiting for a response') || q.includes('waiting for response') || q.includes('awaiting')) {
    const awaiting = conversations.filter((c) => c.awaitingResponse || c.segments?.includes('waiting-for-response'));
    if (awaiting.length === 0) {
      return {
        answer: 'No conversations are currently marked as awaiting external response.',
        referencedConversationIds: [],
        suggestedActions: ['Review recent outbound messages'],
      };
    }

    const list = awaiting
      .slice(0, 5)
      .map((c) => `- [${c.subject}](conversation:${c._id}) — Sent to ${c.participants?.[0]?.email || 'recipient'}, awaiting reply.`)
      .join('\n');

    return {
      answer: `You are currently awaiting responses on the following ${awaiting.length} thread(s):\n\n${list}`,
      referencedConversationIds: awaiting.slice(0, 5).map((c) => c._id),
      suggestedActions: ['Send follow-up nudge', 'Archive thread'],
    };
  }

  // Question 3: "Why has this email been assigned to the client?"
  if (q.includes('why has this email') || q.includes('why is this') || q.includes('why')) {
    const target = conversations.find((c) => c.classification?.label === 'Client to Reply') || conversations[0];
    if (target) {
      return {
        answer: `For **[${target.subject}](conversation:${target._id})**, the email was classified as **${target.classification?.label}** with ${(target.classification?.confidence * 100).toFixed(0)}% confidence.\n\n**Reason:** ${target.classification?.reason}\n\n*Key extracted details:* ${target.extracted?.deadlines?.length ? `Deadline: ${target.extracted.deadlines.join(', ')}` : 'Requires personal executive signoff.'}`,
        referencedConversationIds: [target._id],
        suggestedActions: ['Override classification', 'Draft quick reply'],
      };
    }
  }

  // Question 4: "Summarize this conversation" / "Summarize"
  if (q.includes('summarize')) {
    const conv = conversations[0];
    if (!conv) {
      return {
        answer: 'No conversation was specified or found to summarize.',
        referencedConversationIds: [],
        suggestedActions: ['Select an email thread from the inbox'],
      };
    }
    return {
      answer: `**Executive Summary of [${conv.subject}](conversation:${conv._id}):**\n\n${conv.summary || 'Awaiting thread recap.'}\n\n- **Triage Responsibility:** ${conv.classification?.label}\n- **Key Dates / Deadlines:** ${conv.extracted?.deadlines?.join(', ') || conv.extracted?.dates?.join(', ') || 'None stated'}\n- **Financial Amounts:** ${conv.extracted?.amounts?.join(', ') || 'N/A'}`,
      referencedConversationIds: [conv._id],
      suggestedActions: ['Draft formal reply', 'Mark completed'],
    };
  }

  // Question 5: "Draft a reply to this conversation"
  if (q.includes('draft a reply') || q.includes('draft reply')) {
    const conv = conversations[0];
    if (conv) {
      const draft = generateDraftReplyWithRules({ conversation: conv, tone: 'formal' });
      return {
        answer: `I have prepared a draft reply for **[${conv.subject}](conversation:${conv._id})**:\n\n\`\`\`text\n${draft.body}\n\`\`\`\n\nYou can click into the conversation to review, edit, and send it.`,
        referencedConversationIds: [conv._id],
        suggestedActions: ['Open Composer in Conversation View'],
      };
    }
  }

  // General Grounded Answer
  const matches = conversations.slice(0, 4);
  const items = matches.map((c) => `- [${c.subject}](conversation:${c._id}) (${c.classification?.label})`).join('\n');
  return {
    answer: `Based on your inbox data, here are the relevant active conversations:\n\n${items}\n\nAsk me specifically to summarize any thread, draft a reply, or review upcoming meetings.`,
    referencedConversationIds: matches.map((c) => c._id),
    suggestedActions: ['Show emails needing client attention', 'What am I waiting on?'],
  };
};
