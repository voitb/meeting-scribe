import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  videoAnalysis: defineTable({
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
        startTime: v.string(),
        endTime: v.string(),  
          issue: v.string(),
          improvement: v.string(),
      })),
  improvementSuggestions: v.array(v.string())
    }),
    glossary: v.record(v.string(), v.string()),
    analysisDate: v.string()
  })
  .index("by_url", ["url"])
});