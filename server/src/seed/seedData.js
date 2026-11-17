/**
 * ~45 Hand-Crafted Realistic Email Conversations
 * Covers executive decisions, assistant scheduling, low-confidence edge cases,
 * multi-turn threads, newsletters, vendor payments, and travel.
 */

const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d, h = 0) => new Date(now.getTime() - (d * 24 + h) * 60 * 60 * 1000);

const WORKSPACE_TIMEZONE = 'America/Los_Angeles';

const formatInTZ = (date, options) =>
  new Intl.DateTimeFormat('en-US', { timeZone: WORKSPACE_TIMEZONE, ...options }).format(date);

const makePSTDate = (daysFromNow, hourPST = 17, minutePST = 0) => {
  const pstDayStr = now.toLocaleDateString('en-CA', { timeZone: WORKSPACE_TIMEZONE }); // YYYY-MM-DD
  const [y, m, d] = pstDayStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + daysFromNow, hourPST + 8, minutePST));
};

const formatDeadline = (daysFromNow, hourPST = 17, minutePST = 0) => {
  const d = makePSTDate(daysFromNow, hourPST, minutePST);
  const weekday = formatInTZ(d, { weekday: 'short' });
  const month = formatInTZ(d, { month: 'short' });
  const day = formatInTZ(d, { day: 'numeric' });
  const time = formatInTZ(d, { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${weekday}, ${month} ${day}, ${time} PST`;
};

const formatMeeting = (title, daysFromNow, hourPST = 10, minutePST = 0, attendees = []) => {
  const d = makePSTDate(daysFromNow, hourPST, minutePST);
  const weekday = formatInTZ(d, { weekday: 'short' });
  const month = formatInTZ(d, { month: 'short' });
  const day = formatInTZ(d, { day: 'numeric' });
  const time = formatInTZ(d, { hour: 'numeric', minute: '2-digit', hour12: true });
  return {
    title,
    date: `${weekday}, ${month} ${day}`,
    time: `${time} PST`,
    attendees,
  };
};

export const rawSeedEmails = [
  // 1. Investor Term Sheet Decision (Client to Reply)
  {
    subject: 'Series A Term Sheet Review & Founder Allocation',
    participants: [{ name: 'Marcus Vance', email: 'marcus@vancecap.com' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(1),
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Financial'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.98,
      reason: 'Requires direct founder valuation signoff and board composition approval.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Marc from Vance Capital sent over the finalized Series A term sheet with a $28M pre-money valuation. Awaiting founder signature by Friday 5 PM PST.',
    extracted: {
      dates: ['Friday 5 PM PST'],
      deadlines: [formatDeadline(5, 17, 0)],
      meetings: [],
      amounts: ['$28,000,000', '$5,000,000'],
    },
    messages: [
      {
        from: { name: 'Marcus Vance', email: 'marcus@vancecap.com' },
        subject: 'Series A Term Sheet Review & Founder Allocation',
        body: 'Great catching up yesterday. Attached is the revised term sheet reflecting the $28M valuation and our proposed 1-seat board structure. We need your personal signoff by Friday 5 PM PST so legal can draft the definitive docs.',
        sentAt: hoursAgo(1),
        direction: 'inbound',
      },
    ],
  },

  // 2. Calendar Reschedule (Assistant to Reply)
  {
    subject: 'Rescheduling Q4 Strategy Sync with Product Leads',
    participants: [{ name: 'Elena Rostova', email: 'elena@stridegrowth.io' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(2),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Meetings & Appointments', 'General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.94,
      reason: 'Standard calendar rescheduling request suitable for assistant calendar coordination.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Elena Rostova requested moving the strategy sync from Thursday due to an APAC team conflict. Current status is awaiting calendar coordination; next step is for the assistant to send updated time slots between 10 AM and 1 PM PST on Friday.',
    extracted: {
      dates: ['Friday morning 10am-12pm'],
      deadlines: [],
      meetings: [formatMeeting('Q4 Strategy Sync', 5, 10, 0, ['elena@stridegrowth.io'])],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Elena Rostova', email: 'elena@stridegrowth.io' },
        subject: 'Rescheduling Q4 Strategy Sync with Product Leads',
        body: 'Hi team, a conflict came up with our APAC team on Thursday at 2 PM. Could we push our strategy sync to Friday anytime between 10 AM and 1 PM PST? Let me know what works.',
        sentAt: hoursAgo(2),
        direction: 'inbound',
      },
    ],
  },

  // 3. Low-Confidence Ambiguous Edge Case (Needs Review)
  {
    subject: 'FWD: interesting synergy proposal - thoughts?',
    participants: [{ name: 'Julian Thorne', email: 'julian@craftpointvc.com' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(3),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.58, // < 0.65 triggers needsReview
      reason: 'Forwarded deck with ambiguous intent; unclear whether client wishes to pass or take an intro meeting.',
      needsReview: true,
      source: 'ai',
    },
    summary: 'Julian Thorne forwarded an AI logistics deck asking for brief thoughts. Ambiguous whether client wants to take the meeting.',
    extracted: {
      dates: [],
      deadlines: [],
      meetings: [],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Julian Thorne', email: 'julian@craftpointvc.com' },
        subject: 'FWD: interesting synergy proposal - thoughts?',
        body: 'Passing this along. Seed stage team doing automated supply chain triage. Let me know what you think when you have a minute. Could go either way.',
        sentAt: hoursAgo(3),
        direction: 'inbound',
      },
    ],
  },

  // 4. Vendor Invoice Approval (Assistant to Reply)
  {
    subject: 'Invoice #INV-2026-889: AWS Enterprise Support & Compute',
    participants: [{ name: 'Amazon Web Services Accounts', email: 'no-reply-billing@amazon.com' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(4),
    isRead: true,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Action Required', 'Financial'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.91,
      reason: 'Routine cloud compute invoice needing reconciliation against company card.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Monthly AWS compute invoice totaling $4,821.50 automatically charged to corporate Amex ending in 4091.',
    extracted: {
      dates: ['November 14, 2026'],
      deadlines: [formatDeadline(0, 23, 59)],
      meetings: [],
      amounts: ['$4,821.50'],
    },
    messages: [
      {
        from: { name: 'Amazon Web Services Accounts', email: 'no-reply-billing@amazon.com' },
        subject: 'Invoice #INV-2026-889: AWS Enterprise Support & Compute',
        body: 'Your invoice for October compute usage is ready. Total amount due: $4,821.50. View invoice details in the AWS Billing Console.',
        sentAt: hoursAgo(4),
        direction: 'inbound',
      },
    ],
  },

  // 5. Press Interview Request (Client to Reply)
  {
    subject: 'FinTech Network: Interview on Enterprise AI Agent rollouts',
    participants: [{ name: 'Evelyn Ward', email: 'eward@fintechnetwork.io' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(5),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.95,
      reason: 'FinTech Network broadcast interview request requiring client on-air spokesperson confirmation.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Evelyn Ward from FinTech Network requested a live 10-minute broadcast interview regarding enterprise AI assistant adoption.',
    extracted: {
      dates: ['Next Tuesday Nov 17 at 11:30 AM EST'],
      deadlines: [formatDeadline(1, 17, 0)],
      meetings: [formatMeeting('FinTech Network Live Segment', 2, 11, 30, ['eward@fintechnetwork.io'])],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Evelyn Ward', email: 'eward@fintechnetwork.io' },
        subject: 'FinTech Network: Interview on Enterprise AI Agent rollouts',
        body: 'We are hosting a segment on FinTech Network focusing on AI agents in executive workflows. Would you be open to joining live via studio or remote link? Please let me know by tomorrow.',
        sentAt: hoursAgo(5),
        direction: 'inbound',
      },
    ],
  },

  // 6. Substack Newsletter (No Reply Needed)
  {
    subject: 'Tech Curated: The Architecture of Autonomous Operations',
    participants: [{ name: 'Brett Taylor', email: 'brett@techcurated.com' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(6),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.99,
      reason: 'Weekly editorial newsletter and industry analysis.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Tech Curated deep dive analyzing enterprise workflow automation and specialized AI agent systems.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: [] },
    messages: [
      {
        from: { name: 'Brett Taylor', email: 'brett@techcurated.com' },
        subject: 'Tech Curated: The Architecture of Autonomous Operations',
        body: 'In today’s daily update, we examine how workflow systems are evolving from passive communication tools into proactive agents.',
        sentAt: hoursAgo(6),
        direction: 'inbound',
      },
    ],
  },

  // 7. Multi-Message Thread: Legal Contract Negotiation (Client to Reply)
  {
    subject: 'Master Services Agreement - Enterprise Expansion with Acme Corp',
    participants: [{ name: 'Sarah Lin, General Counsel', email: 'slin@acme-global.com' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(7),
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Legal'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.93,
      reason: 'Contains redlined indemnification cap requiring executive decision before execution.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Acme General Counsel sent redlined MSA. Two outstanding clauses on mutual indemnity limit at 2x annual contract value ($360k).',
    extracted: {
      dates: ['Effective December 1'],
      deadlines: [formatDeadline(15, 17, 0)],
      meetings: [],
      amounts: ['$360,000'],
    },
    messages: [
      {
        from: { name: 'Sarah Lin, General Counsel', email: 'slin@acme-global.com' },
        subject: 'Master Services Agreement - Enterprise Expansion with Acme Corp',
        body: 'Attaching initial draft of our annual enterprise expansion contract ($360k ACV). Please review section 8.2 regarding limitation of liability.',
        sentAt: daysAgo(1, 4),
        direction: 'inbound',
      },
      {
        from: { name: 'Assistant Office', email: 'assistant@mycompany.com' },
        subject: 'Re: Master Services Agreement - Enterprise Expansion with Acme Corp',
        body: 'Thanks Sarah. We had our legal counsel add clarifying language to section 8.2 capping liability at 2x contract value. Sending back for your review.',
        sentAt: daysAgo(1),
        direction: 'outbound',
      },
      {
        from: { name: 'Sarah Lin, General Counsel', email: 'slin@acme-global.com' },
        subject: 'Re: Master Services Agreement - Enterprise Expansion with Acme Corp',
        body: 'Our VP of Legal has agreed to the 2x cap provided the cure period is 30 days. If the founder signs off on this last change, we are ready to execute.',
        sentAt: hoursAgo(7),
        direction: 'inbound',
      },
    ],
  },

  // 8. Flight & Hotel Confirmation (No Reply Needed)
  {
    subject: 'United Airlines: E-Ticket Confirmation for SFO -> JFK (Conf #K89J2P)',
    participants: [{ name: 'United Airlines', email: 'unitedairlines@united.com' }],
    direction: 'inbound',
    lastMessageAt: hoursAgo(8),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.98,
      reason: 'Confirmed airline itinerary and seat assignment notification.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Flight confirmation for SFO to JFK departing Nov 22 at 8:15 AM. Seat 3A First Class confirmed.',
    extracted: {
      dates: ['November 22, 2026'],
      deadlines: [],
      meetings: [],
      amounts: ['$1,240.80'],
    },
    messages: [
      {
        from: { name: 'United Airlines', email: 'unitedairlines@united.com' },
        subject: 'United Airlines: E-Ticket Confirmation for SFO -> JFK (Conf #K89J2P)',
        body: 'Thank you for booking with United. Confirmation code: K89J2P. Flight UA 450 departing SFO 8:15 AM, arriving JFK 4:45 PM.',
        sentAt: hoursAgo(8),
        direction: 'inbound',
      },
    ],
  },

  // 9. Waiting for Response: Catering Vendor Follow-Up (Waiting for Response)
  {
    subject: 'Private Executive Dinner at Spruce SF - Menu Confirmation',
    participants: [{ name: 'Chef Jean-Luc', email: 'events@sprucesf.com' }],
    direction: 'outbound',
    lastMessageAt: hoursAgo(10),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: true,
    assignedTo: 'assistant',
    segments: ['Waiting for Response', 'Meetings & Appointments'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.88,
      reason: 'Awaiting venue manager confirmation on dietary restrictions and wine pairings.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Assistant followed up with Spruce SF regarding dairy-free tasting menu for 8 guests on Dec 4.',
    extracted: {
      dates: ['December 4, 2026'],
      deadlines: [formatDeadline(1, 12, 0)],
      meetings: [formatMeeting('Executive Dinner', 19, 19, 30, ['Chef Jean-Luc', '8 attendees'])],
      amounts: ['$2,400 deposit'],
    },
    messages: [
      {
        from: { name: 'Assistant Office', email: 'assistant@mycompany.com' },
        subject: 'Private Executive Dinner at Spruce SF - Menu Confirmation',
        body: 'Hi Jean-Luc, checking in on the wine pairings and dietary substitutions for our private dining room reservation on Dec 4. Please send over the revised menu when ready.',
        sentAt: hoursAgo(10),
        direction: 'outbound',
      },
    ],
  },

  // 10. Resolved Thread: Office Space Lease Amendment (No Reply Needed / Completed)
  {
    subject: 'Executed Copy: 100 Montgomery Suite 1400 Lease Extension',
    participants: [{ name: 'Marcus Sterling', email: 'msterling@cushwake.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(1, 2),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: true,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.97,
      reason: 'Fully executed legal document for company records. Thread resolved.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Cushman & Wakefield delivered counter-signed office lease extension for 2027. Transaction complete.',
    extracted: {
      dates: ['Commencing Jan 1, 2027'],
      deadlines: [],
      meetings: [],
      amounts: ['$24,500/month'],
    },
    messages: [
      {
        from: { name: 'Marcus Sterling', email: 'msterling@cushwake.com' },
        subject: 'Executed Copy: 100 Montgomery Suite 1400 Lease Extension',
        body: 'All parties have signed via DocuSign. Attached is the fully executed copy for your files. Thank you for your continued tenancy.',
        sentAt: daysAgo(1, 2),
        direction: 'inbound',
      },
    ],
  },

  // 11. Personal Note: Stanford Alumni Mentor Request (Client to Reply)
  {
    subject: 'Quick question from former classmate / Mentorship program',
    participants: [{ name: 'Ananya Rao', email: 'ananya.rao@alumni.stanford.edu' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(1, 5),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['General'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.91,
      reason: 'Personal note from university alumni requesting personal career advice.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Stanford classmate Ananya asking for 15-minute mentorship advice regarding startup spinout.',
    extracted: {
      dates: ['Next two weeks'],
      deadlines: [],
      meetings: [],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Ananya Rao', email: 'ananya.rao@alumni.stanford.edu' },
        subject: 'Quick question from former classmate / Mentorship program',
        body: 'Hope you’ve been doing well! I saw your recent keynote on scaling AI systems. I’m spinning out a lab project and would love 15 minutes of your personal perspective on founder-led sales. Let me know if you might have time!',
        sentAt: daysAgo(1, 5),
        direction: 'inbound',
      },
    ],
  },

  // 12. Low Confidence: Board Observer Memo (Needs Review)
  {
    subject: 'Board Observer thoughts on Q1 Hiring Budget Plan',
    participants: [{ name: 'Karthik Raman', email: 'karthik@summitpeakvc.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(1, 8),
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Important', 'Financial'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.61, // < 0.65 triggers needsReview
      reason: 'Contains both administrative scheduling for finance review and board member strategic opinions.',
      needsReview: true,
      source: 'ai',
    },
    summary: 'Summit Peak Ventures observer sent thoughts on head of engineering compensation band. Suggested reviewing with VP Finance.',
    extracted: {
      dates: ['Before December Board Meeting'],
      deadlines: [],
      meetings: [],
      amounts: ['$275,000 base salary band'],
    },
    messages: [
      {
        from: { name: 'Karthik Raman', email: 'karthik@summitpeakvc.com' },
        subject: 'Board Observer thoughts on Q1 Hiring Budget Plan',
        body: 'Looked at the engineering hiring headcount model. The base bands look reasonable but wanted to check if you wanted to sync with finance first or discuss directly on our 1:1 next week. Not sure if this is for you or your assistant to schedule.',
        sentAt: daysAgo(1, 8),
        direction: 'inbound',
      },
    ],
  },

  // 13. Assistant to Reply: Conference Pass Registration
  {
    subject: 'NeurIPS 2026 Executive Pass Badge Pickup & Speaker Lounge Access',
    participants: [{ name: 'NeurIPS Registration Team', email: 'support@neurips.cc' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(1, 12),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Meetings & Appointments'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.93,
      reason: 'Logistics badge confirmation for upcoming conference attendance.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'NeurIPS confirmed executive VIP pass. Assistant needs to send emergency contact and photo ID info.',
    extracted: {
      dates: ['December 8-14, 2026'],
      deadlines: [formatDeadline(10, 17, 0)],
      meetings: [formatMeeting('NeurIPS 2026 Session', 23, 9, 0, ['speaker lounge'])],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'NeurIPS Registration Team', email: 'support@neurips.cc' },
        subject: 'NeurIPS 2026 Executive Pass Badge Pickup & Speaker Lounge Access',
        body: 'Your executive badge has been provisioned. Please have your administrative coordinator submit the speaker photo and verify hotel shuttle pickup.',
        sentAt: daysAgo(1, 12),
        direction: 'inbound',
      },
    ],
  },

  // 14. GitHub Security Alert (No Reply Needed)
  {
    subject: '[GitHub] Dependabot alert: Moderate severity vulnerability in axios',
    participants: [{ name: 'GitHub Notifications', email: 'notifications@github.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(2, 1),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.99,
      reason: 'Automated developer tooling security alert.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'GitHub security alert regarding dependency bump for internal repo.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: [] },
    messages: [
      {
        from: { name: 'GitHub Notifications', email: 'notifications@github.com' },
        subject: '[GitHub] Dependabot alert: Moderate severity vulnerability in axios',
        body: 'A security vulnerability was detected in a package you use. Bump to axios 1.7.9 recommended.',
        sentAt: daysAgo(2, 1),
        direction: 'inbound',
      },
    ],
  },

  // 15. Client to Reply: Strategic M&A Advisory Intro
  {
    subject: 'Strictly Confidential: Inbound Acquisition Interest from OmniCloud',
    participants: [{ name: 'Brian O’Malley', email: 'bomalley@apexventurepartners.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(2, 4),
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.97,
      reason: 'Confidential M&A inbound interest requiring exclusive founder evaluation.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Brian O’Malley from Apex Venture Partners received an inquiry from OmniCloud Corporate Development regarding strategic product integration or acquisition.',
    extracted: {
      dates: ['Discreet call this Thursday or Friday'],
      deadlines: [],
      meetings: [],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Brian O’Malley', email: 'bomalley@apexventurepartners.com' },
        subject: 'Strictly Confidential: Inbound Acquisition Interest from Salesforce',
        body: 'Reached out by EVP of Corporate Strategy at OmniCloud yesterday. They are deeply impressed by your multi-agent architecture and want to explore strategic options. Need your personal read before I connect the parties.',
        sentAt: daysAgo(2, 4),
        direction: 'inbound',
      },
    ],
  },

  // 16. Assistant to Reply: Office IT Hardware Order
  {
    subject: 'Apple Store for Business: Quote for 4x MacBook Pro M4 Max',
    participants: [{ name: 'Apple Enterprise Direct', email: 'orders@apple.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(2, 7),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Action Required', 'Financial'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.92,
      reason: 'Hardware quote ready for corporate purchase order issuance.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Apple Enterprise quote #APL-9042 for new engineer workstations totaling $14,200.',
    extracted: {
      dates: ['Quote valid until Nov 30'],
      deadlines: [formatDeadline(15, 23, 59)],
      meetings: [],
      amounts: ['$14,200.00'],
    },
    messages: [
      {
        from: { name: 'Apple Enterprise Direct', email: 'orders@apple.com' },
        subject: 'Apple Store for Business: Quote for 4x MacBook Pro M4 Max',
        body: 'Your custom configuration quote is attached. Please submit your PO number to release the order for shipment.',
        sentAt: daysAgo(2, 7),
        direction: 'inbound',
      },
    ],
  },

  // 17. Client to Reply: Keynote Speaker Honorarium & Terms
  {
    subject: 'Invitation: Closing Keynote at VentureStage Annual Summit London',
    participants: [{ name: 'Jessica Hall', email: 'jhall@venturestage.media' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(2, 9),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Meetings & Appointments'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.94,
      reason: 'Prestigious speaking invitation with customized honorarium and topic approval.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'VentureStage Annual Summit inviting client to deliver closing keynote on Dec 11 in London. $15k travel honorarium provided.',
    extracted: {
      dates: ['December 11, 2026'],
      deadlines: [formatDeadline(5, 17, 0)],
      meetings: [formatMeeting('VentureStage Summit Keynote', 26, 8, 0, ['jhall@venturestage.media'])],
      amounts: ['$15,000 honorarium'],
    },
    messages: [
      {
        from: { name: 'Jessica Hall', email: 'jhall@venturestage.media' },
        subject: 'Invitation: Closing Keynote at VentureStage Annual Summit London',
        body: 'We would be honored to host you for our closing keynote on the Main Stage in London this December at VentureStage Summit. We offer a $15,000 travel honorarium and business class accommodations. Please let me know your interest.',
        sentAt: daysAgo(2, 9),
        direction: 'inbound',
      },
    ],
  },

  // 18. Stripe Payout Notification (No Reply Needed)
  {
    subject: 'Stripe: $84,200.00 payout scheduled to Silicon Valley Bank',
    participants: [{ name: 'Stripe Balance', email: 'notifications@stripe.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(3, 1),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['Financial', 'General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.99,
      reason: 'Automated merchant processing payout notification.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Stripe payout of $84,200.00 initiated to primary checking account. Expected arrival within 1-2 business days.',
    extracted: {
      dates: ['Estimated arrival Nov 16'],
      deadlines: [],
      meetings: [],
      amounts: ['$84,200.00'],
    },
    messages: [
      {
        from: { name: 'Stripe Balance', email: 'notifications@stripe.com' },
        subject: 'Stripe: $84,200.00 payout scheduled to Silicon Valley Bank',
        body: 'A payout of $84,200.00 is on its way to your Silicon Valley Bank account ending in 9102.',
        sentAt: daysAgo(3, 1),
        direction: 'inbound',
      },
    ],
  },

  // 19. Assistant to Reply: Reschedule Dental Appointment
  {
    subject: 'Executive Dental Care: Rescheduling Dr. Vance Consultation',
    participants: [{ name: 'Reception desk', email: 'frontdesk@pacificdentalcare.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(3, 3),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.92,
      reason: 'Routine personal medical appointment rescheduling for assistant calendar management.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Dr. Vance clinic asking to shift Thursday 4 PM routine dental cleaning to Friday 8:30 AM.',
    extracted: {
      dates: ['Friday Nov 20 at 8:30 AM'],
      deadlines: [],
      meetings: [formatMeeting('Dental Cleaning', 5, 8, 30, ['Dr. Vance'])],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Reception desk', email: 'frontdesk@pacificdentalcare.com' },
        subject: 'Executive Dental Care: Rescheduling Dr. Vance Consultation',
        body: 'Dr. Vance had an urgent procedure scheduled for Thursday afternoon. Can we move your cleaning appointment to Friday morning at 8:30 AM?',
        sentAt: daysAgo(3, 3),
        direction: 'inbound',
      },
    ],
  },

  // 20. Client to Reply: Advisory Board Equity Grant
  {
    subject: 'Advisory Agreement & 0.25% Equity Grant: Dr. Michael Stone',
    participants: [{ name: 'Dr. Michael Stone', email: 'mstone@cambridge-institute.edu' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(3, 6),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Legal'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.94,
      reason: 'Scientific advisor equity grant approval requiring founder and compensation committee signoff.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Dr. Stone (Cambridge Institute of Technology) agreed to join advisory board; sent signed FAST agreement requesting founder countersignature.',
    extracted: {
      dates: ['Vesting begins Dec 1'],
      deadlines: [formatDeadline(3, 9, 0)],
      meetings: [],
      amounts: ['0.25% equity grant'],
    },
    messages: [
      {
        from: { name: 'Dr. Michael Stone', email: 'mstone@cambridge-institute.edu' },
        subject: 'Advisory Agreement & 0.25% Equity Grant: Dr. Michael Stone',
        body: 'I am delighted to join as an advisor. Attached is the Founder Advisor Standard Template with the agreed 0.25% 2-year vesting terms. Looking forward to your countersignature.',
        sentAt: daysAgo(3, 6),
        direction: 'inbound',
      },
    ],
  },

  // 21. Multi-Message Thread: Awaiting Response on PR Wire Release
  {
    subject: 'Draft Press Release: Series A Funding Announcement Wire',
    participants: [{ name: 'Amanda Cole', email: 'acole@apexprgroup.com' }],
    direction: 'outbound',
    lastMessageAt: daysAgo(3, 9),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: true,
    assignedTo: 'assistant',
    segments: ['Waiting for Response'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.89,
      reason: 'Awaiting PR agency confirmation on quote distribution timing.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Sent Apex Communications updated quotes from lead investor. Waiting for wire distribution schedule.',
    extracted: {
      dates: ['Embargo lifts Wednesday 6:00 AM EST'],
      deadlines: [formatDeadline(2, 11, 0)],
      meetings: [],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Amanda Cole', email: 'acole@apexprgroup.com' },
        subject: 'Draft Press Release: Series A Funding Announcement Wire',
        body: 'Please review the initial draft wire copy. We need quotes from your lead investor finalized.',
        sentAt: daysAgo(4, 2),
        direction: 'inbound',
      },
      {
        from: { name: 'Assistant Office', email: 'assistant@mycompany.com' },
        subject: 'Re: Draft Press Release: Series A Funding Announcement Wire',
        body: 'Hi Amanda, attached are the approved quotes from Marc at Vance Capital and our founder. Please confirm the embargo timing for Wednesday 6 AM EST.',
        sentAt: daysAgo(3, 9),
        direction: 'outbound',
      },
    ],
  },

  // 22. Low Confidence: School Board Parent Committee (Needs Review)
  {
    subject: 'Castilleja School: Annual Fund Gala Auction item contribution',
    participants: [{ name: 'Parent Association Chair', email: 'gala@castillejaschool.org' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(4, 3),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.62, // < 0.65 triggers needsReview
      reason: 'Personal family school auction donation; assistant can coordinate donation details or defer to family.',
      needsReview: true,
      source: 'ai',
    },
    summary: 'Children’s school parent committee requesting contribution for annual gala charity auction.',
    extracted: {
      dates: ['Gala on February 14'],
      deadlines: [formatDeadline(16, 17, 0)],
      meetings: [],
      amounts: ['$5,000 suggested donor tier'],
    },
    messages: [
      {
        from: { name: 'Parent Association Chair', email: 'gala@castillejaschool.org' },
        subject: 'Castilleja School: Annual Fund Gala Auction item contribution',
        body: 'We are organizing the annual scholarship gala auction. Would your family consider donating a mentorship session or joining our host committee? Let us know if you’d like us to coordinate with your assistant or speak directly.',
        sentAt: daysAgo(4, 3),
        direction: 'inbound',
      },
    ],
  },

  // 23. Substack Newsletter: TLDR AI (No Reply Needed)
  {
    subject: 'TLDR AI: DeepSeek-V3 Open Model Architecture & Benchmarks',
    participants: [{ name: 'Dan & Stephen', email: 'dan@tldr.tech' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(4, 6),
    isRead: true,
    isImportant: false,
    isArchived: true,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['Archived', 'General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.99,
      reason: 'Daily technology newsletter summary.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Curated daily briefing on AI models, LLM evals, and developer tooling.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: [] },
    messages: [
      {
        from: { name: 'Dan & Stephen', email: 'dan@tldr.tech' },
        subject: 'TLDR AI: DeepSeek-V3 Open Model Architecture & Benchmarks',
        body: 'Good morning! Today we cover recent advancements in mixture-of-experts architectures and reasoning evals.',
        sentAt: daysAgo(4, 6),
        direction: 'inbound',
      },
    ],
  },

  // 24. Client to Reply: Commercial Real Estate Guarantees
  {
    subject: 'Personal Guarantee Clause: 555 Mission St HQ Lease',
    participants: [{ name: 'Jonathan Price, Commercial Broker', email: 'jprice@meridianrealty.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(4, 10),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Legal'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.96,
      reason: 'Involves personal credit guarantee requirement by building landlord.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Landlord at 555 Mission is requesting either a 6-month letter of credit ($300k) or founder personal guarantee.',
    extracted: {
      dates: ['Lease commencement Feb 1'],
      deadlines: [formatDeadline(3, 17, 0)],
      meetings: [],
      amounts: ['$300,000 security deposit / LOC'],
    },
    messages: [
      {
        from: { name: 'Jonathan Price, Commercial Broker', email: 'jprice@meridianrealty.com' },
        subject: 'Personal Guarantee Clause: 555 Mission St HQ Lease',
        body: 'The landlord’s investment committee reviewed the financials. Given the early stage, they are insisting on either a $300k cash letter of credit or a limited personal guarantee. This is a critical decision only you can make.',
        sentAt: daysAgo(4, 10),
        direction: 'inbound',
      },
    ],
  },

  // 25. Assistant to Reply: Catering Tasting for Board Meeting
  {
    subject: 'Menu Selection: December Board Meeting Luncheon at HQ',
    participants: [{ name: 'Taste Catering SF', email: 'orders@tastecateringsf.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(5, 2),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Meetings & Appointments', 'General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.95,
      reason: 'Administrative lunch order coordination for upcoming board session.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Catering vendor submitted gourmet bento box selections for 12 board members.',
    extracted: {
      dates: ['December 15, 2026'],
      deadlines: [formatDeadline(25, 18, 0)],
      meetings: [formatMeeting('Q4 Board Meeting Lunch', 30, 12, 30, ['12 board members'])],
      amounts: ['$840.00'],
    },
    messages: [
      {
        from: { name: 'Taste Catering SF', email: 'orders@tastecateringsf.com' },
        subject: 'Menu Selection: December Board Meeting Luncheon at HQ',
        body: 'Attached is our winter lunch menu for executive meetings. Please confirm whether you’d like individual artisan boxes or family style service.',
        sentAt: daysAgo(5, 2),
        direction: 'inbound',
      },
    ],
  },

  // 26. Notion Workspace Invoice (No Reply Needed)
  {
    subject: 'Notion receipt: Enterprise plan renewal for 45 members',
    participants: [{ name: 'Notion Billing', email: 'billing@m.notion.so' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(5, 5),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['Financial', 'General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.98,
      reason: 'Automated SaaS subscription receipt.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Notion Enterprise annual subscription receipt for 45 seats totaling $9,720.00.',
    extracted: {
      dates: ['Nov 10, 2026'],
      deadlines: [],
      meetings: [],
      amounts: ['$9,720.00'],
    },
    messages: [
      {
        from: { name: 'Notion Billing', email: 'billing@m.notion.so' },
        subject: 'Notion receipt: Enterprise plan renewal for 45 members',
        body: 'Thank you for using Notion. Your credit card ending in 4091 was charged $9,720.00 for 45 annual seats.',
        sentAt: daysAgo(5, 5),
        direction: 'inbound',
      },
    ],
  },

  // 27. Client to Reply: Angel Co-Investment Opportunity
  {
    subject: 'Allocation offer: $50k angel check in Supabase competitor round',
    participants: [{ name: 'Graham Vance', email: 'graham@vortexcloud.io' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(5, 8),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Financial'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.96,
      reason: 'Personal angel investment syndicate allocation decision.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Guillermo offering $50k personal co-investment allocation in hot developer tools seed round. Wire closes Friday.',
    extracted: {
      dates: ['Wire cutoff Friday Nov 20'],
      deadlines: [formatDeadline(5, 9, 0)],
      meetings: [],
      amounts: ['$50,000'],
    },
    messages: [
      {
        from: { name: 'Graham Vance', email: 'graham@vortexcloud.io' },
        subject: 'Allocation offer: $50k angel check in Supabase competitor round',
        body: 'Saved a $50k allocation for you in the seed round we discussed. The founders are former Postgres maintainers. If you want in on your personal account, let me know today so legal can send the SAFE.',
        sentAt: daysAgo(5, 8),
        direction: 'inbound',
      },
    ],
  },

  // 28. Assistant to Reply: Office Landscaping Contract
  {
    subject: 'Plant Maintenance Service Schedule & Seasonal Rotation',
    participants: [{ name: 'Greenery Office Services', email: 'service@greeneryplants.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(6, 1),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.94,
      reason: 'Facilities maintenance vendor scheduling.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Greenery Plants confirming bi-weekly indoor watering and seasonal poinsettia delivery for lobby.',
    extracted: {
      dates: ['Every other Tuesday starting Nov 18'],
      deadlines: [],
      meetings: [],
      amounts: ['$220/month'],
    },
    messages: [
      {
        from: { name: 'Greenery Office Services', email: 'service@greeneryplants.com' },
        subject: 'Plant Maintenance Service Schedule & Seasonal Rotation',
        body: 'Confirming our technician will service the office plants every other Tuesday morning at 8:00 AM. Please ensure building security has him on the visitor manifest.',
        sentAt: daysAgo(6, 1),
        direction: 'inbound',
      },
    ],
  },

  // 29. Low Confidence: Advisory Inquiry from Unknown Founder (Needs Review)
  {
    subject: 'Quick intros / exploring advisor role for AI fintech',
    participants: [{ name: 'Alex Tremblay', email: 'alex@novafintech.co' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(6, 4),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.59, // < 0.65 triggers needsReview
      reason: 'Cold intro claiming mutual connection; assistant triage advised before burdening client.',
      needsReview: true,
      source: 'ai',
    },
    summary: 'Nova Fintech founder reaching out through cold email referencing mutual investor.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: [] },
    messages: [
      {
        from: { name: 'Alex Tremblay', email: 'alex@novafintech.co' },
        subject: 'Quick intros / exploring advisor role for AI fintech',
        body: 'Hey there! Apex Horizon Fund mentioned you might be interested in our automated lending agent. Wanted to put this on your radar for an informal coffee. Thoughts?',
        sentAt: daysAgo(6, 4),
        direction: 'inbound',
      },
    ],
  },

  // 30. Google Cloud Invoice (No Reply Needed)
  {
    subject: 'Google Cloud Platform Monthly Statement: $3,140.20',
    participants: [{ name: 'Google Payments', email: 'google-payments@google.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(6, 8),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['Financial', 'General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.99,
      reason: 'Monthly Google Cloud hosting receipt.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'GCP invoice for Vertex AI and Cloud Storage totaling $3,140.20 paid automatically.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: ['$3,140.20'] },
    messages: [
      {
        from: { name: 'Google Payments', email: 'google-payments@google.com' },
        subject: 'Google Cloud Platform Monthly Statement: $3,140.20',
        body: 'Your payment of $3,140.20 for Google Cloud Platform services has been processed successfully.',
        sentAt: daysAgo(6, 8),
        direction: 'inbound',
      },
    ],
  },

  // 31. Client to Reply: Compensation Committee Chair Nomination
  {
    subject: 'Board Resolution: Appointment as Compensation Committee Chair',
    participants: [{ name: 'Raymond Sterling', email: 'raymond@highlineventures.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(7, 1),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.97,
      reason: 'Board leadership nomination requiring formal executive acceptance.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Highline Ventures board rep Raymond nominated client to chair the portfolio governance and comp committee.',
    extracted: {
      dates: ['Commencing Q1 2027'],
      deadlines: [formatDeadline(16, 17, 0)],
      meetings: [],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Raymond Sterling', email: 'raymond@highlineventures.com' },
        subject: 'Board Resolution: Appointment as Compensation Committee Chair',
        body: 'The governance committee has unanimously proposed your appointment as Chair of the Executive Compensation Committee. Please confirm your willingness to serve so corporate secretary can circulate the unanimous written consent.',
        sentAt: daysAgo(7, 1),
        direction: 'inbound',
      },
    ],
  },

  // 32. Assistant to Reply: Corporate Card Limit Increase Request
  {
    subject: 'Brex: Verification required for limit increase to $250,000',
    participants: [{ name: 'Brex Underwriting', email: 'underwriting@brex.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(7, 4),
    isRead: true,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Action Required', 'Financial'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.91,
      reason: 'Administrative bank statement upload requested by corporate card underwriter.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Brex requested recent monthly bank statements to finalize approved $250k credit line expansion.',
    extracted: {
      dates: ['Submit within 5 business days'],
      deadlines: [formatDeadline(5, 14, 0)],
      meetings: [],
      amounts: ['$250,000 limit'],
    },
    messages: [
      {
        from: { name: 'Brex Underwriting', email: 'underwriting@brex.com' },
        subject: 'Brex: Verification required for limit increase to $250,000',
        body: 'To finalize your requested limit increase to $250,000, please upload your October operating account statements via the secure document portal.',
        sentAt: daysAgo(7, 4),
        direction: 'inbound',
      },
    ],
  },

  // 33. Multi-Message Thread: Awaiting Response on Candidate Offer
  {
    subject: 'Offer Letter: Staff AI Systems Architect - Dr. Chloe Bennett',
    participants: [{ name: 'Dr. Chloe Bennett', email: 'cbennett@neuralcore.ai' }],
    direction: 'outbound',
    lastMessageAt: daysAgo(7, 7),
    isRead: true,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: true,
    assignedTo: 'assistant',
    segments: ['Waiting for Response', 'Important'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.9,
      reason: 'Awaiting candidate formal acceptance on competitive offer letter.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Sent formal offer letter for Staff AI Systems Architect ($320k base + 1.2% equity). Candidate reviewing until Monday.',
    extracted: {
      dates: ['Offer expiration Monday 5 PM'],
      deadlines: [formatDeadline(2, 17, 0)],
      meetings: [],
      amounts: ['$320,000 base salary', '1.2% equity'],
    },
    messages: [
      {
        from: { name: 'Assistant Office', email: 'assistant@mycompany.com' },
        subject: 'Offer Letter: Staff AI Systems Architect - Dr. Chloe Bennett',
        body: 'Dear Dr. Bennett, attached is the official offer package signed by our founder. We are thrilled at the prospect of you leading our infrastructure research. Please let us know if you have any questions before Monday.',
        sentAt: daysAgo(7, 7),
        direction: 'outbound',
      },
    ],
  },

  // 34. Figma Enterprise Renewal Notice (No Reply Needed)
  {
    subject: 'Figma: Your annual plan renews on December 15, 2026',
    participants: [{ name: 'Figma Renewals', email: 'renewals@figma.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(8, 2),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.98,
      reason: 'Notice of automated enterprise software renewal.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Figma 30-day advance notice of annual enterprise organization renewal.',
    extracted: { dates: ['December 15, 2026'], deadlines: [], meetings: [], amounts: ['$5,400'] },
    messages: [
      {
        from: { name: 'Figma Renewals', email: 'renewals@figma.com' },
        subject: 'Figma: Your annual plan renews on December 15, 2026',
        body: 'This is an automatic notification that your organization’s Figma plan will renew on Dec 15. No action is required if you wish to maintain your current tier.',
        sentAt: daysAgo(8, 2),
        direction: 'inbound',
      },
    ],
  },

  // 35. Client to Reply: Private Wealth Allocation Meeting
  {
    subject: 'Sterling Private Wealth: Tax Loss Harvesting Strategy for Q4',
    participants: [{ name: 'Nicholas Sterling, VP Private Wealth', email: 'nicholas@sterlingwealth.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(8, 5),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Financial'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.95,
      reason: 'Personal private family wealth and tax liquidation decision.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Sterling Private Wealth advisor prepared Q4 personal tax harvesting proposal requiring direct investor signoff.',
    extracted: {
      dates: ['Implement before Dec 15 tax deadline'],
      deadlines: [formatDeadline(30, 14, 0)],
      meetings: [formatMeeting('Q4 Tax Strategy Call', 7, 13, 0, ['nicholas@sterlingwealth.com'])],
      amounts: ['$450,000 estimated offset'],
    },
    messages: [
      {
        from: { name: 'Nicholas Sterling, VP Private Wealth', email: 'nicholas@sterlingwealth.com' },
        subject: 'Sterling Private Wealth: Tax Loss Harvesting Strategy for Q4',
        body: 'We have compiled the year-end rebalancing portfolio for your family trust. By realizing select losses in municipal bond overlays, we can offset approximately $450k of capital gains. Need your direct authorization to proceed.',
        sentAt: daysAgo(8, 5),
        direction: 'inbound',
      },
    ],
  },

  // 36. Assistant to Reply: Office Coffee Subscription Revision
  {
    subject: 'Blue Bottle Coffee: Monthly Bean Subscription Update',
    participants: [{ name: 'Blue Bottle Support', email: 'subscriptions@bluebottlecoffee.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(9, 2),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.94,
      reason: 'Vendor office pantry subscription adjustment.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Blue Bottle inquiring whether to increase Bella Donovan whole bean shipment for expanding engineering floor.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: ['$180/shipment'] },
    messages: [
      {
        from: { name: 'Blue Bottle Support', email: 'subscriptions@bluebottlecoffee.com' },
        subject: 'Blue Bottle Coffee: Monthly Bean Subscription Update',
        body: 'Your next shipment is scheduled for Friday. Would you like to keep the current 10-bag count or add espresso blends for your second floor kitchen?',
        sentAt: daysAgo(9, 2),
        direction: 'inbound',
      },
    ],
  },

  // 37. Low Confidence: Invitation to Podcast with Unclear Prep (Needs Review)
  {
    subject: 'Podcast invite: The Executive Pod with Harrison Cole - prep call timing',
    participants: [{ name: 'Producer, Executive Pod', email: 'production@executivepod.media' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(9, 5),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Meetings & Appointments'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.63, // < 0.65 triggers needsReview
      reason: 'Requires assistant schedule check for recording date, but client must approve editorial topic angles.',
      needsReview: true,
      source: 'ai',
    },
    summary: 'Harrison Cole production team proposing recording next Thursday in London or via SquadCast.',
    extracted: {
      dates: ['Next Thursday 3 PM GMT'],
      deadlines: [],
      meetings: [formatMeeting('The Executive Pod Recording', 4, 10, 0, ['Harrison Cole'])],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Producer, Executive Pod', email: 'production@executivepod.media' },
        subject: 'Podcast invite: The Executive Pod with Harrison Cole - prep call timing',
        body: 'Harrison would love to record a 35-minute episode on agentic workflow orchestration next week. Can your assistant confirm availability for Thursday at 3 PM GMT, and also let us know if any metrics are strictly off the record?',
        sentAt: daysAgo(9, 5),
        direction: 'inbound',
      },
    ],
  },

  // 38. Uber for Business Monthly Statement (No Reply Needed)
  {
    subject: 'Uber Business Statement: October Travel & Commute Expenses',
    participants: [{ name: 'Uber for Business', email: 'uber.us@uber.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(10, 1),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['Financial', 'General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.99,
      reason: 'Automated corporate ride receipt summary.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Uber for Business monthly statement for executive team rides totaling $1,842.10.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: ['$1,842.10'] },
    messages: [
      {
        from: { name: 'Uber for Business', email: 'uber.us@uber.com' },
        subject: 'Uber Business Statement: October Travel & Commute Expenses',
        body: 'Your monthly Uber for Business report has been generated and charged to your Amex ending in 4091.',
        sentAt: daysAgo(10, 1),
        direction: 'inbound',
      },
    ],
  },

  // 39. Client to Reply: Strategic IP Patent Licensing Settlement
  {
    subject: 'CONFIDENTIAL: Settlement Proposal regarding Agent Workflow Patents',
    participants: [{ name: 'Arthur Pendelton, Lead IP Counsel', email: 'apendelton@crestviewlaw.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(10, 4),
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required', 'Legal'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.96,
      reason: 'Major intellectual property settlement offer requiring executive approval.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Crestview Legal IP counsel received a formal cross-licensing agreement resolving patent dispute without litigation.',
    extracted: {
      dates: ['Response due by November 25'],
      deadlines: [formatDeadline(10, 17, 0)],
      meetings: [],
      amounts: ['$120,000 licensing fee'],
    },
    messages: [
      {
        from: { name: 'Arthur Pendelton, Lead IP Counsel', email: 'apendelton@crestviewlaw.com' },
        subject: 'CONFIDENTIAL: Settlement Proposal regarding Agent Workflow Patents',
        body: 'Opposing counsel has formally proposed a mutual cross-license and dismissal with prejudice, subject to a $120k one-time administrative fee. We strongly advise settling. Please provide your executive approval.',
        sentAt: daysAgo(10, 4),
        direction: 'inbound',
      },
    ],
  },

  // 40. Assistant to Reply: Car Detailing & Maintenance Service
  {
    subject: 'Schedule Confirmation: Lucid Air Service & Executive Detail',
    participants: [{ name: 'Lucid Concierge Service', email: 'concierge@lucidmotors.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(11, 2),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.94,
      reason: 'Vehicle maintenance and concierge scheduling suitable for assistant.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Lucid service center confirming flatbed pickup at residential address for annual software and brake inspection.',
    extracted: {
      dates: ['Wednesday Nov 25 at 9:00 AM'],
      deadlines: [],
      meetings: [formatMeeting('Lucid Vehicle Pickup', 10, 9, 0, ['Lucid Concierge'])],
      amounts: ['$650.00 service fee'],
    },
    messages: [
      {
        from: { name: 'Lucid Concierge Service', email: 'concierge@lucidmotors.com' },
        subject: 'Schedule Confirmation: Lucid Air Service & Executive Detail',
        body: 'We are scheduled to pick up your vehicle from your residence on Wednesday at 9:00 AM. Please ensure keys are with your assistant or building concierge.',
        sentAt: daysAgo(11, 2),
        direction: 'inbound',
      },
    ],
  },

  // 41. Resolved Thread: New Health Insurance Plan Enrollment (Completed)
  {
    subject: 'Confirmation: 2027 Group Health Benefits Renewal Complete',
    participants: [{ name: 'Rippling Benefits Desk', email: 'benefits@rippling.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(11, 6),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: true,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.98,
      reason: 'Open enrollment concluded successfully. All team members accounted for.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Rippling confirmed 100% employee open enrollment completion for Anthem Blue Cross and Guardian Dental.',
    extracted: { dates: ['Effective Jan 1, 2027'], deadlines: [], meetings: [], amounts: [] },
    messages: [
      {
        from: { name: 'Rippling Benefits Desk', email: 'benefits@rippling.com' },
        subject: 'Confirmation: 2027 Group Health Benefits Renewal Complete',
        body: 'All 48 employees have finalized their benefit selections for the 2027 plan year. No further action is required.',
        sentAt: daysAgo(11, 6),
        direction: 'inbound',
      },
    ],
  },

  // 42. Client to Reply: Philanthropic Gala Host Committee
  {
    subject: 'San Francisco Symphony: Gala Host Committee & Table Co-Chair',
    participants: [{ name: 'Charlotte Shultz Memorial Foundation', email: 'director@sfsymphony.org' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(12, 1),
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'client',
    segments: ['Important', 'Action Required'],
    classification: {
      label: 'Client to Reply',
      confidence: 0.94,
      reason: 'Personal civic charity leadership invitation requiring direct personal commitment.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'SF Symphony inviting client to co-chair the Opening Night Gala and host a 10-seat patron table ($25k).',
    extracted: {
      dates: ['Gala on September 18'],
      deadlines: [formatDeadline(16, 9, 0)],
      meetings: [],
      amounts: ['$25,000 patron table'],
    },
    messages: [
      {
        from: { name: 'Charlotte Shultz Memorial Foundation', email: 'director@sfsymphony.org' },
        subject: 'San Francisco Symphony: Gala Host Committee & Table Co-Chair',
        body: 'In recognition of your ongoing cultural support, we would be deeply honored if you would co-chair this year’s Opening Night Gala. Please let me know your thoughts on hosting a patron table so we may include your name in the invitation prints.',
        sentAt: daysAgo(12, 1),
        direction: 'inbound',
      },
    ],
  },

  // 43. Assistant to Reply: Corporate Insurance Audit
  {
    subject: 'Beacon Assurance: Annual Workers Comp & General Liability Audit',
    participants: [{ name: 'Beacon Assurance Audit Division', email: 'audit@beaconassurance.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(12, 5),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Action Required', 'Financial'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.93,
      reason: 'Payroll report submission for standard corporate insurance policy audit.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Beacon Assurance requesting W-2 wage summary verification for 2026 workers comp policy reconciliation.',
    extracted: {
      dates: ['Submit by Dec 15'],
      deadlines: [formatDeadline(30, 14, 0)],
      meetings: [],
      amounts: [],
    },
    messages: [
      {
        from: { name: 'Beacon Assurance Audit Division', email: 'audit@beaconassurance.com' },
        subject: 'Beacon Assurance: Annual Workers Comp & General Liability Audit',
        body: 'Your policy term has concluded. Please upload your quarterly 941 payroll reports to our online audit portal before December 15 to ensure accurate premium computation.',
        sentAt: daysAgo(12, 5),
        direction: 'inbound',
      },
    ],
  },

  // 44. Tech Insight Journal Tech Digest (No Reply Needed)
  {
    subject: 'Tech Insight Journal: Behind OpenAI’s Enterprise Sales Expansion',
    participants: [{ name: 'Vivian Rhodes', email: 'editorial@techinsightjournal.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(13, 2),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'none',
    segments: ['General'],
    classification: {
      label: 'No Reply Needed',
      confidence: 0.99,
      reason: 'Subscriber journalism newsletter and market report.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Exclusive investigation into enterprise AI agent licensing revenue and corporate IT adoption.',
    extracted: { dates: [], deadlines: [], meetings: [], amounts: [] },
    messages: [
      {
        from: { name: 'Vivian Rhodes', email: 'editorial@techinsightjournal.com' },
        subject: 'Tech Insight Journal: Behind OpenAI’s Enterprise Sales Expansion',
        body: 'Exclusive reporting on enterprise procurement cycles and how CIOs are contracting for dedicated AI compute clusters.',
        sentAt: daysAgo(13, 2),
        direction: 'inbound',
      },
    ],
  },

  // 45. Multi-Message Thread: Executive Offsite Venue Hold (Assistant to Reply)
  {
    subject: 'Venue Hold: Post Ranch Inn Big Sur - Q1 Leadership Retreat',
    participants: [{ name: 'Claire Delacroix', email: 'events@postranchinn.com' }],
    direction: 'inbound',
    lastMessageAt: daysAgo(13, 7),
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
    awaitingResponse: false,
    assignedTo: 'assistant',
    segments: ['Meetings & Appointments', 'General'],
    classification: {
      label: 'Assistant to Reply',
      confidence: 0.94,
      reason: 'Offsite contract review and deposit payment coordination for assistant team.',
      needsReview: false,
      source: 'ai',
    },
    summary: 'Post Ranch Inn holding 8 ocean houses for leadership offsite on Jan 22-25. 50% deposit ($18,500) required to secure.',
    extracted: {
      dates: ['January 22-25, 2027'],
      deadlines: [formatDeadline(13, 18, 0)],
      meetings: [formatMeeting('Leadership Retreat', 68, 9, 0, ['Executive team'])],
      amounts: ['$18,500 deposit', '$37,000 total'],
    },
    messages: [
      {
        from: { name: 'Claire Delacroix', email: 'events@postranchinn.com' },
        subject: 'Venue Hold: Post Ranch Inn Big Sur - Q1 Leadership Retreat',
        body: 'We have placed a courtesy hold on 8 ocean houses for January 22-25. Attached is the group master agreement. Please sign and submit the 50% deposit before Nov 28 to guarantee the dates.',
        sentAt: daysAgo(13, 7),
        direction: 'inbound',
      },
    ],
  },
];
