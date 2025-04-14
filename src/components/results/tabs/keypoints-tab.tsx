/**
 * Key points tab component
 */
export function KeyPointsTab({ keyPoints }: { keyPoints: string[] }) {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
        Key Discussion Points
      </h3>
      <ul className="space-y-2 sm:space-y-3">
        {keyPoints.map((point, index) => (
          <li key={index} className="bg-muted p-3 sm:p-4 rounded-lg flex">
            <div className="rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <span className="font-semibold text-foreground text-xs sm:text-sm">
                {index + 1}
              </span>
            </div>
            <span className="text-sm sm:text-base text-foreground">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
