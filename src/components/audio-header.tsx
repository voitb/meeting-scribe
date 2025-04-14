import { FileAudio } from "lucide-react";

interface AudioHeaderProps {
  title: string;
}

export function AudioHeader({ title }: AudioHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-6 sm:mb-8 p-3 sm:p-4 bg-muted/30 rounded-lg border">
      <FileAudio className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      <h1 className="text-base sm:text-xl font-medium truncate">{title}</h1>
    </div>
  );
}
