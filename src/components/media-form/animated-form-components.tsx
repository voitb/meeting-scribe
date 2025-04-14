"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, FC } from "react";

type AnimatedDivProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
};

type FadeInDelayProps = AnimatedDivProps & {
  delay?: number;
};

export const AnimatedCardHeader: FC<AnimatedDivProps> = ({
  children,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedCardContent: FC<AnimatedDivProps> = ({
  children,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedDropzone: FC<AnimatedDivProps> = ({
  children,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay: 0.3,
      }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedFilePreview: FC<AnimatedDivProps> = ({
  children,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedButton: FC<AnimatedDivProps> = ({
  children,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedIcon: FC<AnimatedDivProps> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ rotate: -10, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ rotate: 5, scale: 1.1 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const FadeInWithDelay: FC<FadeInDelayProps> = ({
  children,
  delay = 0.2,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
