"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AnimatedFormWrapper } from "../animated-form-wrapper";
import {
  AnimatedCardHeader,
  AnimatedCardContent,
} from "./animated-form-components";
import { useMediaUpload } from "../../hooks/media-form/use-media-upload";
import { MediaDropzone } from "./media-dropzone";
import { FilePreview } from "./file-preview";
import { FileInfo } from "./file-info";
import { AuthInfo } from "./auth-info";

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
        <AnimatedCardHeader className="w-full">
          <CardHeader>
            <CardTitle>Upload Media File</CardTitle>
            <CardDescription className="pb-6">
              Choose an audio or video recording to analyze and create meeting
              notes
              <AuthInfo />
            </CardDescription>
          </CardHeader>
        </AnimatedCardHeader>

        <AnimatedCardContent>
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
        </AnimatedCardContent>
      </Card>
    </AnimatedFormWrapper>
  );
}
