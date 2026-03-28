import mongoose from 'mongoose';

/**
 * Stored AI analysis for Indian equities / pasted financial text.
 * result: strict JSON shape from Gemini (see geminiService).
 */
const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    inputText: {
      type: String,
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

export const Analysis = mongoose.model('Analysis', analysisSchema);
