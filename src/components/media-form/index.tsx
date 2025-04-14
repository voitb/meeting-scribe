"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { AnimatedFormWrapper } from "../animated-form-wrapper";
import { useMediaUpload } from "./hooks/use-media-upload";
import { MediaDropzone } from "./media-dropzone";
import { FilePreview } from "./file-preview";
import { FileInfo } from "./file-info";
import { AuthInfo } from "./auth-info";

/**
 * Main media upload form component
 */
export default function MediaForm() {
  const {
    mediaFile,
    isVideoFile,
    isLoading,
    error,
    handleFileChange,
    handleSubmit,
  } = useMediaUpload();

  return (
    <AnimatedFormWrapper>
      <Card className="border shadow-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CardHeader>
            <CardTitle>Upload Media File</CardTitle>
            <CardDescription className="pb-6">
              Choose an audio or video recording to analyze and create meeting
              notes
              <AuthInfo />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <MediaDropzone
                onFileChange={handleFileChange}
                isLoading={isLoading}
              />

              <FileInfo error={error} />

              {mediaFile && (
                <FilePreview
                  file={mediaFile}
                  isVideo={isVideoFile}
                  isLoading={isLoading}
                />
              )}
            </form>
          </CardContent>
        </motion.div>
      </Card>
    </AnimatedFormWrapper>
  );
}
