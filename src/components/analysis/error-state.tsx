import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <Card className="mb-8 border-destructive shadow-md">
      <CardContent className="pt-6 p-8">
        <h2 className="text-xl font-semibold text-destructive mb-4 text-center">
          An error occurred
        </h2>
        <p className="text-center text-muted-foreground">{error}</p>
      </CardContent>
    </Card>
  );
}
