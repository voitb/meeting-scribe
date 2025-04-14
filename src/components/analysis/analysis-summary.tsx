"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AnalysisSummaryProps {
  summary: string;
}

const AnimatedSummaryCard = ({ children }: { children: React.ReactNode }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  return (
    <AnimatedSummaryCard>
      <Card className="border shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <p className="text-muted-foreground whitespace-pre-line">{summary}</p>
        </CardContent>
      </Card>
    </AnimatedSummaryCard>
  );
}
