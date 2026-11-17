import Anthropic from '@anthropic-ai/sdk';
import { CLASSIFICATION_SYSTEM_PROMPT } from '../../prompts/classifyPrompt.js';
import { DRAFT_REPLY_SYSTEM_PROMPT } from '../../prompts/draftReplyPrompt.js';
import { CHAT_SYSTEM_PROMPT } from '../../prompts/chatPrompt.js';
import {
  classifyWithRules,
  generateDraftReplyWithRules,
  answerChatWithRules,
} from './fallbackEngine.js';

let anthropicClient = null;

export const getAnthropicClient = () => {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY) {
    try {
      anthropicClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        timeout: 10000, // 10s max timeout
      });
    } catch (err) {
      console.warn('[AI Service] Failed to initialize Anthropic client:', err.message);
      anthropicClient = null;
    }
  }
  return anthropicClient;
};

export const getAIStatus = () => {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 5);
  return {
    mode: hasKey ? 'live' : 'fallback',
    provider: hasKey ? 'Anthropic Claude' : 'Deterministic Rule Engine',
    model: hasKey ? 'claude-3-5-sonnet-20241022' : 'rules-v1.0',
    live: hasKey,
  };
};

/**
 * Classifies an email conversation thread.
 * Returns label, confidence, reason, summary, and extracted key info.
 */
export const classifyEmailThread = async ({ subject, messages = [], latestBody = '' }) => {
  const client = getAnthropicClient();

  if (client) {
    try {
      const threadHistory = messages
        .map((m) => `[${m.sentAt ? new Date(m.sentAt).toISOString() : 'Date'}] From: ${m.from?.name || m.from?.email}\n${m.body}`)
        .join('\n\n---\n\n');

      const userContent = `Subject: ${subject}\n\nThread History:\n${threadHistory}\n\nLatest Message:\n${latestBody || '(No extra body)'}`;

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: CLASSIFICATION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      });

      const responseText = response.content?.[0]?.text;
      const parsed = JSON.parse(responseText);

      // Validate schema
      const validLabels = ['Assistant to Reply', 'Client to Reply', 'No Reply Needed'];
      const label = validLabels.includes(parsed.label) ? parsed.label : 'Assistant to Reply';
      const confidence = typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.85;

      return {
        label,
        confidence,
        reason: parsed.reason || 'Classified via Anthropic Claude.',
        needsReview: confidence < 0.65,
        summary: parsed.summary || subject,
        extracted: parsed.extracted || { dates: [], deadlines: [], meetings: [], amounts: [] },
      };
    } catch (error) {
      console.warn(`[AI Service] Live Claude call failed, falling back to deterministic rules: ${error.message}`);
    }
  }

  // Deterministic Fallback
  return classifyWithRules({ subject, messages, latestBody });
};

/**
 * Generates an executive draft reply for a conversation.
 */
export const generateDraftReply = async ({ conversation, messages = [], tone = 'formal' }) => {
  const client = getAnthropicClient();

  if (client) {
    try {
      const threadHistory = messages
        .map((m) => `[${m.from?.name || m.from?.email}]: ${m.body}`)
        .join('\n\n');

      const userContent = `Subject: ${conversation.subject}\nRequested Tone: ${tone}\n\nThread History:\n${threadHistory}`;

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        system: DRAFT_REPLY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      });

      const responseText = response.content?.[0]?.text;
      const parsed = JSON.parse(responseText);
      return {
        subject: parsed.subject || `Re: ${conversation.subject}`,
        body: parsed.body,
        tone: parsed.tone || tone,
        notes: parsed.notes || 'Generated via Claude.',
      };
    } catch (error) {
      console.warn(`[AI Service] Draft reply LLM call failed, using rule engine: ${error.message}`);
    }
  }

  // Deterministic Fallback
  return generateDraftReplyWithRules({ conversation, tone });
};

/**
 * Answers questions grounded in real inbox conversations.
 */
export const answerInboxChat = async ({ query, conversations = [] }) => {
  const client = getAnthropicClient();

  if (client) {
    try {
      const contextData = conversations.slice(0, 10).map((c) => ({
        id: c._id.toString(),
        subject: c.subject,
        sender: c.participants?.[0]?.name || c.participants?.[0]?.email,
        label: c.classification?.label,
        reason: c.classification?.reason,
        summary: c.summary,
        awaitingResponse: c.awaitingResponse,
        lastMessageAt: c.lastMessageAt,
      }));

      const userContent = `User Question: "${query}"\n\nActual Inbox Database Context (JSON):\n${JSON.stringify(contextData, null, 2)}`;

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        system: CHAT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      });

      const responseText = response.content?.[0]?.text;
      const parsed = JSON.parse(responseText);
      return parsed;
    } catch (error) {
      console.warn(`[AI Service] Inbox chat LLM call failed, falling back to rule engine: ${error.message}`);
    }
  }

  // Deterministic Fallback
  return answerChatWithRules({ query, conversations });
};
