"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

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
        <motion.p
          className="text-sm text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      <motion.div
        className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Info className="h-4 w-4 flex-shrink-0" />
        <p>
          Maximum file sizes: 10MB for audio, 25MB for video files. Supported
          formats: MP3, WAV, OGG, M4A, WEBM, MP4, MOV.
        </p>
      </motion.div>
    </>
  );
}
