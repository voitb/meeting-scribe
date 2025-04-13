"use client";

export function HeroSection() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3">
        <span className="text-primary">Meeting</span>Scribe
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Transform audio recordings into high-quality meeting notes with AI
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CheckCircledIcon className="h-5 w-5 text-primary" />
          <span>Audio transcription</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CheckCircledIcon className="h-5 w-5 text-primary" />
          <span>Intelligent summaries</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CheckCircledIcon className="h-5 w-5 text-primary" />
          <span>Structured notes</span>
        </div>
      </div>
    </div>
  );
}
// Icon component
function CheckCircledIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
