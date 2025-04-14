"use client";

import PresentationQualityView from "@/components/presentation-quality-view";
import { motion, AnimatePresence } from "framer-motion";
import type { PresentationQuality } from "@/types/analysis";

interface QualityTabProps {
  quality?: PresentationQuality;
  onSegmentClick?: (start: string, end: string) => void;
}

// Osobny komponent opakowujący dla animacji
const AnimatedTabContent = ({ children }: { children: React.ReactNode }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="container p-0 sm:p-4 md:p-6 mx-auto"
    >
      {children}
    </motion.div>
  );
};

/**
 * Quality tab component displaying presentation quality analysis
 */
export function QualityTab({ quality, onSegmentClick }: QualityTabProps) {
  if (!quality) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <AnimatedTabContent>
        <PresentationQualityView
          quality={quality}
          onSegmentClick={onSegmentClick}
        />
      </AnimatedTabContent>
    </AnimatePresence>
  );
}
