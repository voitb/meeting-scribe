import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId, isUserAuthenticated } from "./users";

// Check if audio already exists
export const checkAudioExists = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    // Check if the user is authenticated
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    // If there is no user, the audio doesn't exist in the database (not saved)
    if (!isAuthenticated) {
      return false;
    }
    
    const userId = await getUserId(ctx);
    
    // Check if audio belonging to this user exists
    const audio = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
    
    return audio !== null;
  },
});

// Adding new analysis
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
    // Check if the user is authenticated
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    // If the user is not logged in, don't save the analysis
    if (!isAuthenticated) {
      console.log("User not logged in - analysis will not be saved");
      return null;
    }
    
    const userId = await getUserId(ctx);
    
    // If we don't have a userId, abort
    if (!userId) {
      console.log("No user ID found - analysis will not be saved");
      return null;
    }
    
    console.log(`Saving analysis for user: ${userId}`);
    
    // Add the user ID to the analysis data
    const analysisId = await ctx.db.insert("audioAnalysis", {
      ...args,
      userId
    });
    
    return analysisId;
  },
});

// Getting analysis by URL (audio ID)
export const getAudioAnalysis = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    // Check if the user is authenticated
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    // If the user is not logged in, they don't have access to saved analyses
    if (!isAuthenticated) {
      return null;
    }
    
    const userId = await getUserId(ctx);
    
    // Retrieve analysis belonging to the logged-in user
    return await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
  },
});

// Getting all user analyses
export const getAllAudioAnalyses = query({
  args: {},
  handler: async (ctx) => {
    // Check if the user is authenticated
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    // If the user is not logged in, return an empty array
    if (!isAuthenticated) {
      return [];
    }
    
    const userId = await getUserId(ctx);
    
    // Retrieve all analyses belonging to the logged-in user
    return await ctx.db
      .query("audioAnalysis")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
  },
});

// Getting recent user analyses
export const getRecentAudioAnalyses = query({
  args: {},
  handler: async (ctx) => {
    // Check if the user is authenticated
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    // If the user is not logged in, return an empty array
    if (!isAuthenticated) {
      return [];
    }
    
    const userId = await getUserId(ctx);
    
    // Retrieve recent analyses belonging to the logged-in user
    return await ctx.db
      .query("audioAnalysis")
      .filter(q => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(3);
  },
});

// New endpoint for filtering audio analyses based on different criteria
export const filterAudioAnalyses = query({
  args: {
    // Optional filter criteria
    searchTerm: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("title"), v.literal("analysisDate"))),
    sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    // If user is not logged in, return empty result
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
    
    // Start building the query with user filter
    let query = ctx.db
      .query("audioAnalysis")
      .withIndex("by_user", (q) => q.eq("userId", userId));
    
    // Apply date range filters if provided
    if (startDate) {
      query = query.filter(q => q.gte(q.field("analysisDate"), startDate));
    }
    
    if (endDate) {
      query = query.filter(q => q.lte(q.field("analysisDate"), endDate));
    }
    
    // Get all results to filter in memory
    const totalResults = await query.collect();
    
    // Apply simple title matching for search term (if provided)
    // This is a basic approach since Convex doesn't support full-text search natively
    let filteredResults = totalResults;
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const term = args.searchTerm.toLowerCase().trim();
      filteredResults = totalResults.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.summary.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting in memory
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
    
    // Apply pagination in memory
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

// Store audio blob in the database
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
    
    // Check if user is authenticated
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
    
    // Check file size limit (25MB)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
    if (args.fileSize > MAX_FILE_SIZE) {
      console.log(`[Convex] File size exceeds limit - aborting`);
      throw new Error(`File size exceeds the 25MB limit. Current size: ${Math.round(args.fileSize / (1024 * 1024))}MB`);
    }
    
    // Look up the existing analysis
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
    
    // Update the record with audio blob data
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

// Retrieve audio blob from database
export const getAudioBlob = query({
  args: { audioId: v.string() },
  handler: async (ctx, args) => {
    console.log(`[Convex] getAudioBlob called for audioId: ${args.audioId}`);
    
    // Check if user is authenticated
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
    
    // Query for the audio analysis that contains the blob
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

// Retrieve audio blob from database without requiring authentication
export const getAudioBlobPublic = query({
  args: { audioId: v.string() },
  handler: async (ctx, args) => {
    console.log(`[Convex] getAudioBlobPublic called for audioId: ${args.audioId}`);
    
    // This query allows public access to audio blobs for playback purposes
    // without requiring authentication
    
    // Query for the audio analysis that contains the blob
    // We still need to filter by url (audioId) but we don't filter by userId
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

// Update existing analysis or create new if not exists
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
    // Check if the user is authenticated
    const isAuthenticated = await isUserAuthenticated(ctx);
    
    // If the user is not logged in, don't save/update the analysis
    if (!isAuthenticated) {
      console.log("User not logged in - analysis will not be updated");
      return null;
    }
    
    const userId = await getUserId(ctx);
    
    // If we don't have a userId, abort
    if (!userId) {
      console.log("No user ID found - analysis will not be updated");
      return null;
    }
    
    console.log(`Looking for existing analysis with URL ${args.url} for user ${userId}`);
    
    // Check if entry already exists
    const existingAnalysis = await ctx.db
      .query("audioAnalysis")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();
    
    if (existingAnalysis) {
      console.log(`Updating existing analysis with ID ${existingAnalysis._id}`);
      
      // Update the existing entry
      await ctx.db.patch(existingAnalysis._id, {
        ...args,
        userId
      });
      
      return existingAnalysis._id;
    } else {
      console.log(`No existing analysis found, creating new entry`);
      
      // Create a new entry
      const analysisId = await ctx.db.insert("audioAnalysis", {
        ...args,
        userId
      });
      
      return analysisId;
    }
  },
});
