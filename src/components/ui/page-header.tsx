import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

export function PageHeader() {
  return (
    <div className="page-header py-4 md:py-6">
      <div className="flex flex-col items-start gap-4 md:flex-row">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Your Meeting Notes
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and revisit your transcribed recordings.
          </p>
        </div>
        <div className="flex-shrink-0">
          <NewAnalysisButton />
        </div>
      </div>
    </div>
  );
}

function NewAnalysisButton() {
  return (
    <Button asChild>
      <Link href="/" className="gap-2">
        <PenLine className="h-4 w-4" />
        New Analysis
      </Link>
    </Button>
  );
}
