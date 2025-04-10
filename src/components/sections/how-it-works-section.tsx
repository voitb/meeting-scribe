"use client";

import { motion } from "framer-motion";
import { FileText, BookOpen } from "lucide-react";

export function HowItWorksSection() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <section className="text-center">
      <motion.h2
        className="text-3xl font-bold text-foreground mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        How it works
      </motion.h2>
      <motion.div
        className="grid md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          className="flex flex-col items-center p-6"
          variants={itemVariants}
        >
          <motion.div
            className="bg-accent/40 rounded-full p-4 mb-6"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FileText className="h-8 w-8 text-foreground" />
          </motion.div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Paste YouTube URL
          </h3>
          <p className="text-muted-foreground">
            Enter the link to any educational YouTube video you want to analyze
          </p>
        </motion.div>
        <motion.div
          className="flex flex-col items-center p-6"
          variants={itemVariants}
        >
          <motion.div
            className="bg-accent/40 rounded-full p-4 mb-6"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <svg
              className="h-8 w-8 text-foreground"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L6.5 11H17.5L12 2Z" fill="currentColor" />
              <path
                d="M17.5 22C15.0147 22 13 19.9853 13 17.5C13 15.0147 15.0147 13 17.5 13C19.9853 13 22 15.0147 22 17.5C22 19.9853 19.9853 22 17.5 22Z"
                fill="currentColor"
              />
              <path d="M3 13.5H11V21.5H3V13.5Z" fill="currentColor" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            AI Processing
          </h3>
          <p className="text-muted-foreground">
            AI analyzes the video content and extracts valuable information
          </p>
        </motion.div>
        <motion.div
          className="flex flex-col items-center p-6"
          variants={itemVariants}
        >
          <motion.div
            className="bg-accent/40 rounded-full p-4 mb-6"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <BookOpen className="h-8 w-8 text-foreground" />
          </motion.div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Get Materials
          </h3>
          <p className="text-muted-foreground">
            Receive a complete package of learning materials ready to use
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
