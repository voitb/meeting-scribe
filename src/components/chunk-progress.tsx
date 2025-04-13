"use client";

import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ChunkProgressProps {
  message: string;
  totalChunks: number;
  currentChunk: number;
  chunkProgress: number;
  overallProgress: number;
}

export function ChunkProgress({
  message,
  totalChunks,
  currentChunk,
  chunkProgress,
  overallProgress,
}: ChunkProgressProps) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>Total progress: {Math.round(overallProgress)}%</span>
        {totalChunks > 1 && (
          <span>
            Part {currentChunk} of {totalChunks}
          </span>
        )}
      </div>

      <Progress value={overallProgress} className="h-2 mb-2" />

      {totalChunks > 1 && currentChunk <= totalChunks && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Current part progress: {Math.round(chunkProgress)}%</span>
          </div>
          <Progress value={chunkProgress} className="h-1 mb-3" />
        </div>
      )}

      <div className="flex items-center justify-center mt-3">
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
        <p className="text-sm text-center text-muted-foreground">{message}</p>
      </div>

      {totalChunks > 1 && (
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: totalChunks }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i + 1 < currentChunk
                  ? "bg-primary"
                  : i + 1 === currentChunk
                    ? "bg-primary/70"
                    : "bg-primary/20"
              }`}
              animate={
                i + 1 === currentChunk
                  ? {
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                repeat: i + 1 === currentChunk ? Infinity : 0,
                duration: 1.5,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
