import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId, isUserAuthenticated } from "./users";

export const checkAudioExists = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    if (!isAuthenticated) {
      return false;
    }
    
    const userId = await getUserId(ctx);
    
    const audio = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
    
    return audio !== null;
  },
});

export const addAudioAnalysis = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    summary: v.string(),
    keyPoints: v.array(v.string()),
    meetingOutcomes: v.array(v.string()),
    audioChapters: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),  
      title: v.string(),
      description: v.string(),
    })),
    presentationQuality: v.object({
      overallClarity: v.string(),
      difficultSegments: v.array(v.object({
          startTime: v.string(),
          endTime: v.string(), 
          issue: v.string(),
          improvement: v.string(),
      })),
  improvementSuggestions: v.array(v.string())
    }),
    glossary: v.record(v.string(), v.string()),
    analysisDate: v.string()
  },
  handler: async (ctx, args) => {
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    if (!isAuthenticated) {
      console.log("User not logged in - analysis will not be saved");
      return null;
    }
    
    const userId = await getUserId(ctx);
    
    if (!userId) {
      console.log("No user ID found - analysis will not be saved");
      return null;
    }
    
    console.log(`Saving analysis for user: ${userId}`);
    
    const analysisId = await ctx.db.insert("audioAnalysis", {
      ...args,
      userId
    });
    
    return analysisId;
  },
});

export const getAudioAnalysis = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    if (!isAuthenticated) {
      return null;
    }
    
    const userId = await getUserId(ctx);
    
    return await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
  },
});

export const getAllAudioAnalyses = query({
  args: {},
  handler: async (ctx) => {
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    if (!isAuthenticated) {
      return [];
    }
    
    const userId = await getUserId(ctx);
    
    return await ctx.db
      .query("audioAnalysis")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
  },
});

export const getRecentAudioAnalyses = query({
  args: {},
  handler: async (ctx) => {
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    if (!isAuthenticated) {
      return [];
    }
    
    const userId = await getUserId(ctx);
    
    return await ctx.db
      .query("audioAnalysis")
      .filter(q => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(3);
  },
});

export const filterAudioAnalyses = query({
  args: {
    searchTerm: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("title"), v.literal("analysisDate"))),
    sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    if (!isAuthenticated) {
      return { 
        analyses: [],
        total: 0
      };
    }
    
    const userId = await getUserId(ctx);
    if (!userId) {
      return { 
        analyses: [],
        total: 0
      };
    }
    
    const { startDate, endDate, limit = 10, skip = 0, sortBy = "analysisDate", sortDirection = "desc" } = args;
    
    let query = ctx.db
      .query("audioAnalysis")
      .withIndex("by_user", (q) => q.eq("userId", userId));
    
    if (startDate) {
      query = query.filter(q => q.gte(q.field("analysisDate"), startDate));
    }
    
    if (endDate) {
      query = query.filter(q => q.lte(q.field("analysisDate"), endDate));
    }
    
    const totalResults = await query.collect();
    
    let filteredResults = totalResults;
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const term = args.searchTerm.toLowerCase().trim();
      filteredResults = totalResults.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.summary.toLowerCase().includes(term)
      );
    }
    
    filteredResults.sort((a, b) => {
      const fieldA = a[sortBy as keyof typeof a];
      const fieldB = b[sortBy as keyof typeof b];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      return 0;
    });
    
    const paginatedResults = filteredResults.slice(skip, skip + limit);
    
    return {
      analyses: paginatedResults,
      total: filteredResults.length,
      pagination: {
        limit,
        skip,
        hasMore: skip + paginatedResults.length < filteredResults.length
      }
    };
  },
});

export const storeAudioBlob = mutation({
  args: {
    audioId: v.string(),
    audioBlob: v.bytes(),
    fileName: v.string(),
    duration: v.number(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`[Convex] storeAudioBlob called for audioId: ${args.audioId}`);
    console.log(`[Convex] fileName: ${args.fileName}`);
    console.log(`[Convex] fileSize: ${args.fileSize} bytes`);
    console.log(`[Convex] audioBlob size: ${args.audioBlob.byteLength} bytes`);
    
    const isAuthenticated = await isUserAuthenticated(ctx);
    console.log(`[Convex] isAuthenticated: ${isAuthenticated}`);
    
    if (!isAuthenticated) {
      console.log(`[Convex] Authentication required - aborting`);
      throw new Error("Authentication required to store audio files");
    }
    
    const userId = await getUserId(ctx);
    console.log(`[Convex] userId: ${userId}`);
    
    if (!userId) {
      console.log(`[Convex] No user ID found - aborting`);
      throw new Error("User ID not found");
    }
    
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (args.fileSize > MAX_FILE_SIZE) {
      console.log(`[Convex] File size exceeds limit - aborting`);
      throw new Error(`File size exceeds the 25MB limit. Current size: ${Math.round(args.fileSize / (1024 * 1024))}MB`);
    }
    
    console.log(`[Convex] Looking up analysis for url: ${args.audioId}, userId: ${userId}`);
    const existingAnalysis = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.audioId))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
    
    if (!existingAnalysis) {
      console.log(`[Convex] No existing analysis found - aborting`);
      throw new Error("Analysis not found");
    }
    
    console.log(`[Convex] Found existing analysis with ID: ${existingAnalysis._id}`);
    console.log(`[Convex] Updating record with audio blob data`);
    
    await ctx.db.patch(existingAnalysis._id, {
      audioBlob: args.audioBlob,
      audioFileName: args.fileName,
      audioDuration: args.duration,
      audioSize: args.fileSize
    });
    
    console.log(`[Convex] Successfully updated record with audio blob data`);
    
    return {
      success: true,
      audioId: args.audioId,
      fileName: args.fileName
    };
  }
});

export const getAudioBlob = query({
  args: { audioId: v.string() },
  handler: async (ctx, args) => {
    console.log(`[Convex] getAudioBlob called for audioId: ${args.audioId}`);
    
    const isAuthenticated = await isUserAuthenticated(ctx);
    console.log(`[Convex] isAuthenticated: ${isAuthenticated}`);
    
    if (!isAuthenticated) {
      console.log(`[Convex] User not authenticated - returning null`);
      return null;
    }
    
    const userId = await getUserId(ctx);
    console.log(`[Convex] userId: ${userId}`);
    
    if (!userId) {
      console.log(`[Convex] No user ID found - returning null`);
      return null;
    }
    
    console.log(`[Convex] Looking for analysis with url: ${args.audioId}, userId: ${userId}`);
    const analysis = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.audioId))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
    
    if (!analysis) {
      console.log(`[Convex] No analysis found for audioId: ${args.audioId}`);
      return null;
    }
    
    if (!analysis.audioBlob) {
      console.log(`[Convex] Analysis found but no audio blob is stored`);
      return null;
    }
    
    console.log(`[Convex] Found analysis with ID: ${analysis._id}`);
    console.log(`[Convex] Audio blob size: ${analysis.audioBlob.byteLength} bytes`);
    console.log(`[Convex] Filename: ${analysis.audioFileName || 'unknown'}`);
    
    return {
      audioBlob: analysis.audioBlob,
      fileName: analysis.audioFileName,
      duration: analysis.audioDuration,
      size: analysis.audioSize
    };
  }
});

export const getAudioBlobPublic = query({
  args: { audioId: v.string() },
  handler: async (ctx, args) => {
    console.log(`[Convex] getAudioBlobPublic called for audioId: ${args.audioId}`);
    
    console.log(`[Convex] Looking for any analysis with url: ${args.audioId}`);
    const analysis = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.audioId))
      .first();
    
    if (!analysis) {
      console.log(`[Convex] No analysis found for audioId: ${args.audioId}`);
      return null;
    }
    
    if (!analysis.audioBlob) {
      console.log(`[Convex] Analysis found but no audio blob is stored`);
      console.log(`[Convex] Analysis ID: ${analysis._id}, userId: ${analysis.userId}`);
      return null;
    }
    
    console.log(`[Convex] Found analysis with ID: ${analysis._id}`);
    console.log(`[Convex] Audio blob size: ${analysis.audioBlob.byteLength} bytes`);
    console.log(`[Convex] Filename: ${analysis.audioFileName || 'unknown'}`);
    
    return {
      audioBlob: analysis.audioBlob,
      fileName: analysis.audioFileName,
      duration: analysis.audioDuration,
      size: analysis.audioSize
    };
  }
});

export const updateAudioAnalysis = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    summary: v.string(),
    keyPoints: v.array(v.string()),
    meetingOutcomes: v.array(v.string()),
    audioChapters: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),  
      title: v.string(),
      description: v.string(),
    })),
    presentationQuality: v.object({
      overallClarity: v.string(),
      difficultSegments: v.array(v.object({
          startTime: v.string(),
          endTime: v.string(), 
          issue: v.string(),
          improvement: v.string(),
      })),
      improvementSuggestions: v.array(v.string())
    }),
    glossary: v.record(v.string(), v.string()),
    analysisDate: v.string()
  },
  handler: async (ctx, args) => {
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    if (!isAuthenticated) {
      console.log("User not logged in - analysis will not be updated");
      return null;
    }
    
    const userId = await getUserId(ctx);
    
    if (!userId) {
      console.log("No user ID found - analysis will not be updated");
      return null;
    }
    
    console.log(`Looking for existing analysis with URL ${args.url} for user ${userId}`);
    
    const existingAnalysis = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
    
    if (existingAnalysis) {
      console.log(`Updating existing analysis with ID ${existingAnalysis._id}`);
      
      await ctx.db.patch(existingAnalysis._id, {
        ...args,
        userId
      });
      
      return existingAnalysis._id;
    } else {
      console.log(`No existing analysis found, creating new entry`);
      
      const analysisId = await ctx.db.insert("audioAnalysis", {
        ...args,
        userId
      });
      
      return analysisId;
    }
  },
});
