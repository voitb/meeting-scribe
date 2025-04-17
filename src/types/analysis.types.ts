// Type definitions used in analysis

export type VideoAnalysisResult = {
	title: string;
	summary: string;
	keyPoints: string[];
	actionItems?: {
		task: string;
		dueDate?: string;
	}[];
	decisionsMade?: string[];
	videoChapters: VideoChapter[];
	error?: string; // Optional error field to indicate issues with analysis
};

export type VideoChapter = {
	startTime: string;
	endTime: string;
	title: string;
	description?: string;
};

// ParsedAIResponse should reflect the JSON structure from the prompt
export interface ParsedAIResponse {
	summary: string;
	keyPoints: string[];
	actionItems?: { task: string; dueDate?: string }[];
	decisionsMade?: string[];
	videoChapters: VideoChapter[];
	[key: string]: unknown; // Allow for flexibility if AI adds extra fields
}

// --- Transcription related types (unchanged) ---
export interface Transcription {
	task: string;
	language: string;
	duration: number;
	text: string;
	words: Word[];
	segments: Segment[];
	x_groq?: {
		// Optional metadata
		id: string;
	};
}

export interface Word {
	word: string;
	start: number; // seconds
	end: number; // seconds
}

export interface Segment {
	id: number;
	seek: number;
	start: number; // seconds
	end: number; // seconds
	text: string;
	tokens?: number[]; // Optional
	temperature?: number; // Optional
	avg_logprob?: number; // Optional
	compression_ratio?: number; // Optional
	no_speech_prob?: number; // Optional
}
