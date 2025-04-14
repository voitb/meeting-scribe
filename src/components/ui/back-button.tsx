import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Back navigation button component
 */
export function BackButton() {
  return (
    <div className="flex items-center mb-4 sm:mb-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-1 sm:gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Link href="/">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-sm sm:text-base">Back</span>
        </Link>
      </Button>
    </div>
  );
}
