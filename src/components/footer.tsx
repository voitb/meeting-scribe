"use client";

import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function Footer() {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.3 });

  return (
    <motion.footer
      ref={footerRef}
      className="mt-12 py-6 px-4 sm:px-6"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <motion.div
            className="flex items-center space-x-4 mb-4 sm:mb-0"
            variants={itemVariants}
          >
            <motion.a
              href="https://github.com/voitb/meeting-scribe"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/bartosz-wojtczak-6493291a2/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </motion.a>
          </motion.div>
          <motion.div
            className="text-sm text-muted-foreground"
            variants={itemVariants}
          >
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <span className="mx-2">•</span>
            <span>© {new Date().getFullYear()} MeetingScribe</span>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}
