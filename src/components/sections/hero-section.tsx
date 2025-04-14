"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="text-center py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3"
        variants={itemVariants}
      >
        <motion.span
          className="text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Meeting
        </motion.span>
        Scribe
      </motion.h1>
      <motion.p
        className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        variants={itemVariants}
      >
        Transform audio recordings into meeting notes with AI
      </motion.p>
      <motion.div
        className="flex flex-col md:flex-row gap-4 justify-center mb-8"
        variants={containerVariants}
      >
        <motion.div
          className="flex items-center justify-center gap-2 text-muted-foreground"
          variants={featureVariants}
          whileHover={{ scale: 1.05 }}
        >
          <AnimatedCheckCircledIcon className="h-5 w-5 text-primary" />
          <span>Audio analysis</span>
        </motion.div>
        <motion.div
          className="flex items-center justify-center gap-2 text-muted-foreground"
          variants={featureVariants}
          whileHover={{ scale: 1.05 }}
        >
          <AnimatedCheckCircledIcon className="h-5 w-5 text-primary" />
          <span>Intelligent summaries</span>
        </motion.div>
        <motion.div
          className="flex items-center justify-center gap-2 text-muted-foreground"
          variants={featureVariants}
          whileHover={{ scale: 1.05 }}
        >
          <AnimatedCheckCircledIcon className="h-5 w-5 text-primary" />
          <span>Structured notes</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex justify-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.div
          initial={{ y: 0 }}
          animate={{
            y: [0, 10, 0],
            transition: {
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            },
          }}
          className="cursor-pointer"
          onClick={() => {
            window.scrollBy({
              top: window.innerHeight,
              behavior: "smooth",
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Statyczny komponent SVG
function CheckCircledIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// Osobny komponent animowany
function AnimatedCheckCircledIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
    >
      <CheckCircledIcon {...props} />
    </motion.div>
  );
}
