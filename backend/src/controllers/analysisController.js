import { validationResult } from 'express-validator';
import { Analysis } from '../models/Analysis.js';
import { analyzeFinancialText } from '../services/geminiService.js';

/**
 * Runs Gemini analysis and persists to analyses collection.
 */
export async function createAnalysis(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const companyName = (req.body.companyName || '').trim();
  const inputText = (req.body.inputText || '').trim();

  if (!inputText || inputText.length < 20) {
    return res.status(400).json({
      error: 'Please provide at least 20 characters of financial text or report content.',
    });
  }

  try {
    const result = await analyzeFinancialText(inputText, companyName);

    const doc = await Analysis.create({
      userId: req.userId,
      companyName,
      inputText,
      result,
      createdAt: new Date(),
    });

    return res.status(201).json({
      id: doc._id,
      companyName: doc.companyName,
      result: doc.result,
      createdAt: doc.createdAt,
    });
  } catch (e) {
    console.error('createAnalysis', e);
    const msg = e?.message || 'Analysis failed';
    if (/GEMINI_API_KEY|not configured/i.test(msg)) {
      return res.status(503).json({ error: 'AI service is not configured' });
    }
    if (/JSON|parse|Missing field/i.test(msg)) {
      return res.status(502).json({
        error: 'AI returned an unexpected format. Please try again.',
        detail: process.env.NODE_ENV === 'development' ? msg : undefined,
      });
    }
    return res.status(502).json({
      error: 'Unable to complete analysis. Please retry in a moment.',
    });
  }
}

export async function listAnalyses(req, res) {
  try {
    const items = await Analysis.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      items: items.map((a) => ({
        id: a._id,
        companyName: a.companyName,
        result: a.result,
        createdAt: a.createdAt,
      })),
    });
  } catch (e) {
    console.error('listAnalyses', e);
    return res.status(500).json({ error: 'Failed to load analyses' });
  }
}

export async function getAnalysis(req, res) {
  try {
    const doc = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!doc) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    return res.json({
      id: doc._id,
      companyName: doc.companyName,
      inputText: doc.inputText,
      result: doc.result,
      createdAt: doc.createdAt,
    });
  } catch (e) {
    console.error('getAnalysis', e);
    return res.status(500).json({ error: 'Failed to load analysis' });
  }
}
