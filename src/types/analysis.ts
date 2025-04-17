import type { VideoChapter } from "@/components/video-chapters";

export interface DifficultSegment {
	startTime: string;
	endTime: string;
	issue: string;
	improvement: string;
}

export interface ActionItem {
	task: string;
	dueDate?: string;
}

export interface AnalysisResult {
	title?: string;
	summary: string;
	keyPoints: string[];
	decisionsMade?: string[];
	actionItems?: ActionItem[];
	videoChapters?: VideoChapter[];
	analysisDate?: string;
	error?: string;
}

export type AnalysisStatus =
	| "loading"
	| "processing"
	| "completed"
	| "ready"
	| "error";

export interface AnalysisStep {
	name: string;
	progress: number;
}

export interface AudioAnalysisData {
	title?: string;
	summary?: string;
	keyPoints?: string[];
	meetingOutcomes?: string[];
	audioChapters?: Array<{
		startTime: string;
		endTime: string;
		title: string;
		description: string;
	}>;
	analysisDate?: string;
}
