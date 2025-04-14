"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const AnimatedRecentAudioComponents = {
  ViewAllButton: ({ children }: { children: ReactNode }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ x: 5 }}
      >
        {children}
      </motion.div>
    );
  },

  ArrowIcon: ({ children }: { children: ReactNode }) => {
    return (
      <motion.div
        initial={{ x: 0 }}
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  },

  CardTitle: ({
    children,
    index = 0,
  }: {
    children: ReactNode;
    index?: number;
  }) => {
    return (
      <motion.div
        className="mb-2 text-lg font-medium line-clamp-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 + index * 0.1 }}
      >
        {children}
      </motion.div>
    );
  },

  CardDescription: ({
    children,
    index = 0,
  }: {
    children: ReactNode;
    index?: number;
  }) => {
    return (
      <motion.p
        className="text-muted-foreground text-sm line-clamp-2 mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.1 }}
      >
        {children}
      </motion.p>
    );
  },

  CardDate: ({
    children,
    index = 0,
  }: {
    children: ReactNode;
    index?: number;
  }) => {
    return (
      <motion.div
        className="flex items-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 + index * 0.1 }}
      >
        {children}
      </motion.div>
    );
  },

  ViewButton: ({
    children,
    index = 0,
  }: {
    children: ReactNode;
    index?: number;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
        whileHover={{ scale: 1.05 }}
      >
        {children}
      </motion.div>
    );
  },
};
