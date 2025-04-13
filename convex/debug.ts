import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all analyses for a specific audioId
export const getAllAnalysesForAudioId = query({
  args: { audioId: v.string() },
  handler: async (ctx, args) => {
    // Query for all audio analyses matching this audioId (url)
    const analyses = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.audioId))
      .collect();
    
    return analyses.map(analysis => ({
      ...analysis,
      // Replace blob with a boolean indicator to avoid sending large data
      audioBlob: analysis.audioBlob ? true : null
    }));
  },
});

// Get all analyses in the database (for debugging)
export const getAllAnalyses = query({
  args: {},
  handler: async (ctx) => {
    // Get all analyses
    const analyses = await ctx.db
      .query("audioAnalysis")
      .collect();
    
    return analyses.map(analysis => ({
      _id: analysis._id,
      url: analysis.url,
      title: analysis.title,
      userId: analysis.userId,
      audioFileName: analysis.audioFileName,
      audioDuration: analysis.audioDuration,
      audioSize: analysis.audioSize,
      hasBlobData: !!analysis.audioBlob
    }));
  },
}); 