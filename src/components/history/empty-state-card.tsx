import { Card, CardContent } from "@/components/ui/card";

export function EmptyStateCard() {
  return (
    <Card className="bg-accent/10">
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">
          You haven&apos;t analyzed any audio files yet
        </p>
      </CardContent>
    </Card>
  );
}
