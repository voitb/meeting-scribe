"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FilePreviewProps {
  file: File;
  isVideo: boolean;
  isLoading: boolean;
}

/**
 * Component to display file info and submit button
 */
export function FilePreview({ file, isVideo, isLoading }: FilePreviewProps) {
  return (
    <div className="flex items-center justify-between bg-muted/10 p-3 rounded-lg">
      <div>
        <p className="font-medium">{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {isVideo ? "Video" : "Audio"} •{" "}
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          "Analyze"
        )}
      </Button>
    </div>
  );
}
