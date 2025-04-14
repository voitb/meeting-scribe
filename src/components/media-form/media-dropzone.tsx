"use client";

import { AudioLines, Video } from "lucide-react";
import { AnimatedDropzone, AnimatedIcon } from "./animated-form-components";

interface MediaDropzoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

/**
 * File upload dropzone component for audio and video files
 */
export function MediaDropzone({ onFileChange, isLoading }: MediaDropzoneProps) {
  return (
    <div className="flex items-center justify-center w-full">
      <AnimatedDropzone className="w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-muted border-dashed rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/10 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="flex gap-2 mb-3">
              <AnimatedIcon>
                <AudioLines className="w-8 h-8 text-muted-foreground" />
              </AnimatedIcon>
              <AnimatedIcon>
                <Video className="w-8 h-8 text-muted-foreground" />
              </AnimatedIcon>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Audio: MP3, WAV, OGG, M4A, WEBM (Max. 10MB)
              <br />
              Video: MP4, MKV, WEBM, MOV (Max. 25MB)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="audio/*,video/mp4,video/x-matroska,video/webm,video/quicktime"
            onChange={onFileChange}
            disabled={isLoading}
          />
        </label>
      </AnimatedDropzone>
    </div>
  );
}
