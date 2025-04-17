import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
	...authTables,
	audioAnalysis: defineTable({
		userId: v.string(),
		url: v.string(),
		title: v.string(),
		summary: v.string(),
		keyPoints: v.array(v.string()),
		meetingOutcomes: v.optional(v.array(v.string())),
		actionItems: v.optional(
			v.array(
				v.object({
					person: v.string(),
					task: v.string(),
					dueDate: v.optional(v.string()),
				})
			)
		),
		audioChapters: v.array(
			v.object({
				startTime: v.string(),
				endTime: v.string(),
				title: v.string(),
				description: v.string(),
			})
		),
		analysisDate: v.string(),
		audioBlob: v.optional(v.bytes()),
		audioFileName: v.optional(v.string()),
		audioDuration: v.optional(v.number()),
		audioSize: v.optional(v.number()),
	})
		.index("by_url", ["url"])
		.index("by_user", ["userId"]),
});
