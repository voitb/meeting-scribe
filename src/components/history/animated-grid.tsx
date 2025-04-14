"use client";

import { motion } from "framer-motion";
import { ReactNode, Children } from "react";

interface AnimatedGridProps {
  children: ReactNode;
}

export function AnimatedGrid({ children }: AnimatedGridProps) {
  // Warianty animacji dla kontenera
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

  // Warianty animacji dla poszczególnych elementów
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.5,
      },
    },
  };

  // Funkcja mapująca dzieci na animowane elementy
  const animatedChildren = Children.map(children, (child) => {
    return (
      <motion.div
        className="h-full flex flex-col"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        whileHover={{
          y: -5,
          transition: { duration: 0.2 },
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex-1 flex flex-col h-full w-full">{child}</div>
      </motion.div>
    );
  });

  return (
    <motion.div
      className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      style={{ gridAutoRows: "1fr" }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {animatedChildren}
    </motion.div>
  );
}
