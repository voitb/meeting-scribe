# MeetingScribe - AI-Powered Meeting Analysis

![MeetingScribe Logo](https://via.placeholder.com/1200x600/4F46E5/FFFFFF?text=MeetingScribe)

> **MeetingScribe** transforms audio and video recordings into comprehensive meeting notes using AI, making your meetings more productive and accessible.

## 📖 About

MeetingScribe is an open-source web application developed for a Next.js Hackathon. The project initially started as a YouTube video analysis tool, but due to copyright and legal concerns (which we realized too late), we pivoted to a meeting analysis application focused on user-uploaded content.

This pivot allowed us to maintain the core AI-based analysis features while creating a useful tool for professionals who need to extract insights from their audio and video recordings - perfect for meetings, lectures, or any spoken content.

## ✨ Key Features

- **Multiple Media Support**: Handles various audio formats (MP3, WAV, OGG, M4A, WEBM) and video formats (MP4, MKV, WEBM, MOV)
- **AI-Powered Analysis**: Uses Groq API to generate:
  - Comprehensive summaries
  - Key points extraction
  - Video chapter detection
  - Presentation quality assessment
  - Glossary of terms
  - Action items detection
- **User Experience**:
  - Modern, responsive UI with smooth animations
  - Organized results in an intuitive tabbed interface
  - Light/dark mode support
  - Progress tracking for long analyses
- **Practical Outputs**:
  - PDF export of analysis results
  - Interactive transcript navigation
  - Historical access to previous analyses
- **Security & Privacy**:
  - User authentication via Clerk
  - Secure data storage with Convex
  - Temporary file handling

## 🖥️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Convex (serverless backend and database)
- **Authentication**: Clerk
- **AI Services**: Groq API (Whisper for transcription, LLM for analysis)
- **Media Processing**: ffmpeg for audio extraction
- **Document Generation**: pdfkit for PDF exports

## 🔧 Project Structure

The application follows a clean architecture:

```
src/
├── app/                # Next.js app router
│   ├── api/            # API routes
│   ├── history/        # User history page
│   ├── result/         # Analysis results page
│   └── ...
├── components/         # React components
│   ├── analysis/       # Analysis-related components
│   ├── history/        # History page components
│   ├── media-form/     # Media upload components
│   ├── presentation-quality-view/ # Quality assessment view
│   ├── results/        # Results display components
│   ├── sections/       # Landing page sections
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Core utilities and services
│   ├── audio-utils.js  # Audio processing utilities
│   ├── file-utils.js   # File handling utilities
│   ├── services/       # Service integrations
│   └── ...
├── types/              # TypeScript type definitions
└── utils/              # Helper utilities
```

## 🔍 Key Implementation Details

### Core Processing Pipeline

The heart of the application is the media processing and analysis pipeline:

1. **Media Upload & Processing** (`src/utils/analyze-utils.ts`)

   - Handles file uploads via the `processMediaFile()` function
   - Uses ffmpeg for extracting audio from video files
   - Manages temporary file handling and cleanup

2. **Transcription Engine** (`src/lib/audio-utils.ts`)

   - Interfaces with Groq API to transcribe audio using Whisper
   - Generates detailed transcriptions with timestamps
   - Structures data for further analysis

3. **Analysis Service** (`src/lib/services/analysis-service.ts`)

   - Takes transcriptions and performs deep content analysis
   - Generates summaries, key points, and other insights
   - Handles context management for large transcripts

4. **Progress Tracking** (`src/lib/progress-store.ts`, `src/utils/progress-utils.ts`)
   - Real-time progress monitoring for long-running operations
   - Provides step-by-step updates during processing
   - Calculates percentage completion for user feedback

### Key Components

1. **Media Upload Form** (`src/components/media-form/media-form.tsx`)

   - Drag-and-drop interface with file validation
   - Animated feedback using Framer Motion
   - Handles the initial user interaction

2. **Results Interface** (`src/components/results/results-tabs.tsx`)

   - Tab-based organization of analysis results
   - Animated transitions between different views
   - Provides a clear structure for consuming complex information

3. **Presentation Quality View** (`src/components/presentation-quality-view.tsx`)

   - Visualizes speaking quality assessment
   - Identifies difficult segments with improvement suggestions
   - Interactive navigation to problematic parts of the recording

4. **Analysis History** (`src/components/history/analysis-grid.tsx`, `src/components/history/analysis-card.tsx`)
   - Grid layout with equal-height cards for history items
   - Staggered animations for visual engagement
   - Filtering and sorting capabilities

### API Routes & Data Flow

1. **Analysis Endpoint** (`src/app/api/analyze/route.ts`)

   - Handles the initial file upload and analysis request
   - Manages the entire analysis pipeline
   - Returns comprehensive analysis results

2. **Progress Tracking API** (`src/app/api/progress/[audioId]/route.ts`)

   - Provides real-time progress updates
   - Allows the frontend to poll for completion status
   - Improves user experience during long-running operations

3. **PDF Generation** (`src/app/api/generate-pdf/route.ts`, `src/utils/pdf-utils.ts`)

   - Converts analysis results into downloadable PDF documents
   - Formats content with proper structure and hierarchy
   - Includes transcriptions, summaries, and all analysis components

4. **Audio Retrieval** (`src/app/api/get-audio/[audioId]/route.ts`, `src/utils/audio-service.ts`)
   - Streams processed audio files to the client
   - Handles format conversion and compatibility
   - Manages secure access to media files

### Animation System

The application features a sophisticated animation system:

1. **Animation Architecture** (`src/components/sections/animated-section-components.tsx`)

   - Contains reusable animation variants and components
   - Provides consistent motion patterns across the application
   - Implements staggered animations for lists and grids

2. **Tab Animation** (`src/components/results/tabs/tab-list.tsx`)

   - Interactive tab selection with animated indicators
   - Smooth transitions between content sections
   - Visual feedback for active elements

3. **Card Animations** (`src/components/history/animated-grid.tsx`)
   - Equal-height card animations with hover effects
   - Staggered entrance animations for better visual flow
   - Performance optimizations for larger collections

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm
- ffmpeg (for video processing)
- API Keys for:
  - Groq
  - Clerk
  - Convex

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/meetingscribe.git
cd meetingscribe
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables by creating a `.env.local` file:

```
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

4. Start the development server:

```bash
pnpm dev:all
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 How It Works

1. **Media Upload**: User uploads an audio or video file through the interface
2. **Processing Pipeline**:
   - Audio extraction (if video file)
   - File transcription using Whisper
   - AI analysis of the transcript
3. **Results Generation**:
   - Transcript is analyzed to create summaries, key points, etc.
   - Results are formatted and displayed in an organized interface
   - Analysis is saved to the user's history (if logged in)

## 🎨 UI/UX Highlights

The application features a thoughtful UI with:

- Animated components for a more engaging experience
- Card-based design for organizing information
- Responsive layouts that work well on all devices
- Accessible interface elements
- Immediate visual feedback for user actions

## 🔓 Open Source License

MeetingScribe is MIT licensed. See the [LICENSE](LICENSE) file for more details.

## 👥 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🌟 Acknowledgements

- This project was created for a Next.js Hackathon
- Thanks to the creators of Next.js, Convex, Clerk, and other open-source tools that make projects like this possible
- Special thanks to Groq for providing powerful AI capabilities
