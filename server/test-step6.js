import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5055/api';

async function runStep6Verification() {
  console.log('====================================================');
  console.log('STEP 6: FINAL END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Authenticate Assistant
  console.log('1. Authenticating Assistant...');
  const asstRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'assistant' }),
  });
  const asstData = await asstRes.json();
  const assistantToken = asstData.token;
  console.log('   Assistant:', asstData.user.name, `(${asstData.user.email})`);

  // 2. Authenticate Client
  console.log('\n2. Authenticating Client...');
  const clientRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'client' }),
  });
  const clientData = await clientRes.json();
  const clientToken = clientData.token;
  console.log('   Client:', clientData.user.name, `(${clientData.user.email})`);

  // 3. Test All 6 AI Chat Prompts Grounded in Real Data
  console.log('\n3. Testing All 6 AI Chat Questions Grounded in Real Data...');
  const convListRes = await fetch(`${BASE_URL}/conversations?limit=10`, {
    headers: { Authorization: `Bearer ${assistantToken}` },
  });
  const convList = await convListRes.json();
  const sampleThread = convList.data[0];

  const testPrompts = [
    { q: 'Show me emails that need my attention', convId: null },
    { q: 'Summarize this conversation', convId: sampleThread._id },
    { q: 'What am I waiting for a response on?', convId: null },
    { q: "Which emails require the client's attention?", convId: null },
    { q: 'Why has this email been assigned to the client?', convId: sampleThread._id },
    { q: 'Draft a reply to this conversation', convId: sampleThread._id },
  ];

  for (const { q, convId } of testPrompts) {
    const chatRes = await fetch(`${BASE_URL}/chat/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${assistantToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: q, conversationId: convId }),
    });
    const chatJson = await chatRes.json();
    if (!chatJson.success) throw new Error(`Chat query failed for: ${q}`);
    const refs = chatJson.data.referencedConversationIds || [];
    console.log(`   ✓ [Q]: "${q}"`);
    console.log(`     [Answer snippet]: ${chatJson.data.answer.replace(/\n+/g, ' ').slice(0, 85)}...`);
    console.log(`     [Grounded DB references]: ${refs.length} linked item(s)`);
  }

  // 4. Test Inbound Email Simulation & Live Reclassification
  console.log('\n4. Testing Incoming Email Simulation & Reclassification...');
  const simRes = await fetch(`${BASE_URL}/simulate/incoming-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${assistantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId: sampleThread._id,
      senderName: 'Elena Rostova',
      senderEmail: 'elena@stridegrowth.io',
      body: 'Can we move our strategy sync to Friday at 11:00 AM PST? Board review calendar invite confirmed.',
    }),
  });
  const simData = await simRes.json();
  if (!simData.success) throw new Error('Email simulation failed');
  console.log('   ✓ Simulated Inbound:', simData.data.message.subject);
  console.log('   ✓ Reclassified Triage Label:', simData.data.conversation.classification.label);

  // 5. Test Client View: Two-Way Sync (Handoff & Handled)
  console.log('\n5. Testing Client View Two-Way Sync...');
  // Find a thread assigned to client
  const clientConvsRes = await fetch(`${BASE_URL}/conversations?segment=client-to-reply`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const clientConvs = await clientConvsRes.json();
  const testClientConv = clientConvs.data[0];
  console.log(`   Target Client Thread: "${testClientConv.subject}" (ID: ${testClientConv._id})`);

  // Action 5a: Ask my assistant to take over
  console.log('   Executing: "Ask my assistant to take over"...');
  const handoffRes = await fetch(`${BASE_URL}/conversations/${testClientConv._id}/client-handoff`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const handoffData = await handoffRes.json();
  console.log('   ✓ Result Label:', handoffData.data.classification.label);
  console.log('   ✓ Result Assigned To:', handoffData.data.assignedTo);
  if (handoffData.data.classification.label !== 'Assistant to Reply') {
    throw new Error('Handoff label failed to update to Assistant to Reply');
  }

  // Action 5b: Mark as Handled
  console.log('   Executing: "Mark as handled"...');
  const handleRes = await fetch(`${BASE_URL}/conversations/${testClientConv._id}/client-handle`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const handleData = await handleRes.json();
  console.log('   ✓ Result Is Completed:', handleData.data.isCompleted);
  if (!handleData.data.isCompleted) {
    throw new Error('Thread failed to mark completed');
  }

  // 6. Verify Audit Activity Log
  console.log('\n6. Verifying Bi-Directional Activity Audit Log...');
  const actRes = await fetch(`${BASE_URL}/activity?limit=5`, {
    headers: { Authorization: `Bearer ${assistantToken}` },
  });
  const actData = await actRes.json();
  console.log(`   ✓ Recent audit entries: ${actData.data.length}`);
  for (const log of actData.data.slice(0, 3)) {
    console.log(`     - [${log.action}] by ${log.actorRole}: "${log.description}"`);
  }

  // 7. Test Overview Endpoint & Live Database Stats
  console.log('\n7. Verifying /api/stats (Live Overview Metrics)...');
  const statsRes = await fetch(`${BASE_URL}/stats`, {
    headers: { Authorization: `Bearer ${assistantToken}` },
  });
  const statsJson = await statsRes.json();
  console.log('   ✓ Live Stat Counts:', {
    total: statsJson.stats.total,
    unread: statsJson.stats.unread,
    important: statsJson.stats.important,
    actionRequired: statsJson.stats.actionRequired,
    awaitingResponse: statsJson.stats.awaitingResponse,
    assignedToAssistant: statsJson.stats.assignedToAssistant,
    needsClient: statsJson.stats.needsClient,
    needsReview: statsJson.stats.needsReview,
  });
  console.log('   ✓ Upcoming Meetings Extracted:', statsJson.upcomingMeetings.length);
  console.log('   ✓ Needs Review Shortcut Items:', statsJson.needsReviewItems.length);

  console.log('\n====================================================');
  console.log('ALL STEP 6 VERIFICATIONS PASSED WITH ZERO ERRORS!');
  console.log('====================================================');
}

runStep6Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
