import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sprawdzanie czy video już istnieje
export const checkVideoExists = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videoAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    
    return video !== null;
  },
});

// Dodawanie nowej analizy
export const addVideoAnalysis = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    thumbnail: v.string(),
    summary: v.string(),
    keyPoints: v.array(v.string()),
    videoChapters: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),  
      title: v.string(),
      description: v.string(),
    })),
    presentationQuality: v.object({
      overallClarity: v.string(),
      difficultSegments: v.array(v.object({
          timeRange: v.string(),
          issue: v.string(),
          improvement: v.string(),
      })),
  improvementSuggestions: v.array(v.string())
    }),
    glossary: v.record(v.string(), v.string()),
    analysisDate: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("videoAnalysis", args);
  },
});

// Pobieranie analizy po URL
export const getVideoAnalysis = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
  },
});

// Pobieranie wszystkich analiz
export const getAllVideoAnalyses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("videoAnalysis")
      .collect();
  },
});

export const getRecentVideoAnalyses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("videoAnalysis")
      .order("desc")
      .take(3);
  },
});
