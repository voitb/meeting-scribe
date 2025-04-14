/**
 * Summary tab component
 */
export function SummaryTab({ summary }: { summary: string }) {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
        Meeting Summary
      </h3>
      <div className="bg-muted p-4 sm:p-6 rounded-lg">
        <p className="text-sm sm:text-base text-foreground whitespace-pre-line">
          {summary}
        </p>
      </div>
    </div>
  );
}
