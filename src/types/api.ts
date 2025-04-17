export type ApiErrorResponse = {
	error: string;
};

export type ApiResponseOptions = {
	status?: number;
	headers?: Record<string, string>;
};

export type ApiSuccessResponse<T> = T;

export interface PDFGenerationData {
	title?: string;
	summary: string;
	keyPoints: string[];
	transcription?: string;
	videoChapters?: {
		startTime: string;
		endTime: string;
		title: string;
		description: string;
	}[];
	analysisDate?: string;
}

export interface TranscriptionDeleteResponse {
	success: boolean;
	message: string;
	error?: string;
}

export interface AudioFetchOptions {
	audioId: string;
}

export interface AudioResponse {
	buffer: Buffer;
	contentType: string;
	fileName: string;
}

export interface AudioErrorResponse {
	error: string;
	details?: unknown;
}

export interface ConvexAudioData {
	audioBlob: ArrayBuffer;
	fileName?: string;
}

export interface AudioMetadataResponse {
	audioId: string;
	originalFileName: string;
	metadata: {
		duration: number;
		language: string;
		processingDate: string;
		fileSize: number;
	};
	error?: string;
}

export interface TranscriptionSegment {
	id: number;
	seek: number;
	start: number;
	end: number;
	text: string;
	tokens: number[];
	temperature: number;
	avg_logprob: number;
	compression_ratio: number;
	no_speech_prob: number;
}

export interface TranscriptionWord {
	word: string;
	start: number;
	end: number;
}

export interface Transcription {
	task: string;
	language: string;
	duration: number;
	text: string;
	segments: TranscriptionSegment[];
	words: TranscriptionWord[];
}

export interface TranscriptionResponse {
	transcription: Transcription;
	error?: string;
}

export interface MediaDetails {
	title?: string;
	id?: string;
	originalFileName?: string;
}

export interface SummarizeRequestData {
	videoDetails?: MediaDetails;
	audioDetails?: MediaDetails;
	audioId?: string;
	transcription: Transcription;
	outputLanguage?: string;
}

export interface VideoChapter {
	startTime: string;
	endTime: string;
	title: string;
	description?: string;
}

export interface EnhancedAnalysisResult {
	title: string;
	summary: string;
	keyPoints: string[];
	actionItems?: {
		task: string;
		dueDate?: string;
	}[];
	decisionsMade?: string[];
	videoChapters: VideoChapter[];
	userId?: string;
	analysisDate: string;
	sourceUrl?: string;
	originalFileName?: string;
}
