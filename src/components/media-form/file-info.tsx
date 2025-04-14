"use client";

import { Info } from "lucide-react";
import { FadeInWithDelay, AnimatedIcon } from "./animated-form-components";

interface FileInfoProps {
  error?: string;
}

/**
 * Component to display file format information and errors
 */
export function FileInfo({ error }: FileInfoProps) {
  return (
    <>
      {error && (
        <FadeInWithDelay delay={0}>
          <p className="text-sm text-destructive">{error}</p>
        </FadeInWithDelay>
      )}

      <FadeInWithDelay delay={0.3}>
        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
          <AnimatedIcon>
            <Info className="h-4 w-4 flex-shrink-0" />
          </AnimatedIcon>
          <p>
            Maximum file sizes: 10MB for audio, 25MB for video files. Supported
            formats: MP3, WAV, OGG, M4A, WEBM, MP4, MOV.
          </p>
        </div>
      </FadeInWithDelay>
    </>
  );
}
