import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock } from "lucide-react";

interface AudioCardProps {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
}

export function AudioCard({ id, title, summary, date, url }: AudioCardProps) {
  return (
    <Card
      key={id}
      className="overflow-hidden hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="mb-2 text-lg font-medium line-clamp-1">{title}</div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {summary.substring(0, 120)}...
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {date}
          </div>
          <Button size="sm" asChild>
            <Link href={`/result/${url}`}>View Results</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
