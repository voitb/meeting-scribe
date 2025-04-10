"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    },
  };

  return (
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.div
        className="inline-flex items-center justify-center p-2 bg-accent/50 rounded-full mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
      >
        <span className="text-sm font-medium text-foreground">
          AI-Powered Learning
        </span>
      </motion.div>
      <motion.h1
        className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        YouTube Learning Assistant
      </motion.h1>
      <motion.p
        className="text-xl text-muted-foreground max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        Transform YouTube videos into comprehensive educational materials with
        the power of AI
      </motion.p>
      <motion.div
        className="inline-flex items-center justify-center mt-4 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">Maximum video length: 5 minutes</span>
      </motion.div>
    </motion.div>
  );
}
