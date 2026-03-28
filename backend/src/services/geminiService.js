import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Extract JSON from model output (handles markdown fences or extra prose).
 */
export function parseAnalysisJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty model response');
  }
  let text = rawText.trim();

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    text = fence[1].trim();
  }

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('No JSON object found in response');
  }
  text = text.slice(first, last + 1);

  const parsed = JSON.parse(text);
  validateAnalysisShape(parsed);
  return parsed;
}

function validateAnalysisShape(obj) {
  const required = [
    'summary',
    'key_metrics',
    'risks',
    'sentiment',
    'investor_takeaway',
    'confidence_score',
  ];
  for (const key of required) {
    if (obj[key] === undefined || obj[key] === null) {
      throw new Error(`Missing field: ${key}`);
    }
  }
  if (!Array.isArray(obj.key_metrics) || !Array.isArray(obj.risks)) {
    throw new Error('key_metrics and risks must be arrays');
  }
  const raw = String(obj.sentiment).trim().toLowerCase();
  const map = { bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral' };
  obj.sentiment = map[raw] || 'Neutral';
  let score = Number(obj.confidence_score);
  if (Number.isNaN(score)) score = 5;
  obj.confidence_score = Math.min(10, Math.max(1, Math.round(score)));
}

const SYSTEM_INSTRUCTION = `You are a senior equity research analyst focused on Indian listed companies (NSE/BSE).
Analyze the user's financial report text or company context. Output ONLY valid JSON, no markdown, no commentary.
The JSON must match this exact structure and key names:
{
  "summary": "string, 2-4 sentences",
  "key_metrics": ["string", "..."],
  "risks": ["string", "..."],
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "investor_takeaway": "string, concise actionable insight",
  "confidence_score": number from 1 to 10
}
Use Indian market context where relevant (INR, quarterly results, regulatory bodies). If information is insufficient, state assumptions in summary and lower confidence_score.`;

/**
 * Calls Gemini 2.5 Flash with structured JSON output; retries on transient failures.
 * @param {string} financialText - Long-form report or pasted news
 * @param {string} [companyHint] - Optional company name for context
 */
export async function analyzeFinancialText(financialText, companyHint = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const userPart = [
    companyHint
      ? `Company or ticker context (may be empty): ${companyHint}\n\n`
      : '',
    'Financial text to analyze:\n\n',
    financialText.slice(0, 900_000),
  ].join('');

  let lastErr;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(userPart);
      const text = result.response.text();
      return parseAnalysisJson(text);
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e);
      // Do not retry JSON validation / parse issues — only transient API failures
      const transient =
        /429|503|500|502|504|RESOURCE_EXHAUSTED|UNAVAILABLE|timeout|ETIMEDOUT|ECONNRESET|fetch/i.test(
          msg
        );
      if (!transient || attempt === MAX_RETRIES - 1) break;
      await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }
  throw lastErr || new Error('Gemini analysis failed');
}
