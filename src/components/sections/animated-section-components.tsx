"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, FC } from "react";

// Typy dla komponentów animowanych
type AnimatedDivProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
};

type AnimatedHeadingProps = HTMLMotionProps<"h2"> & {
  children: ReactNode;
};

// Warianty animacji
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100,
    },
  },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100,
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Komponenty z animacjami

// Dla nagłówków sekcji
export const AnimatedSectionHeading: FC<AnimatedHeadingProps> = ({
  children,
  variants = fadeInDown,
  initial = "hidden",
  animate = "visible",
  className = "text-3xl font-bold text-foreground mb-4",
  ...props
}) => {
  return (
    <motion.h2
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      {...props}
    >
      {children}
    </motion.h2>
  );
};

// Dla opisów sekcji
export const AnimatedSectionDescription: FC<AnimatedDivProps> = ({
  children,
  variants = fadeIn,
  initial = "hidden",
  animate = "visible",
  className = "text-muted-foreground max-w-2xl mx-auto",
  ...props
}) => {
  return (
    <motion.p
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      transition={{ delay: 0.2 }}
      {...props}
    >
      {children}
    </motion.p>
  );
};

// Dla kart
export const AnimatedCard: FC<AnimatedDivProps & { index?: number }> = ({
  children,
  index = 0,
  variants = fadeInUp,
  initial = "hidden",
  animate = "visible",
  whileHover = { y: -5, transition: { duration: 0.2 } },
  className = "",
  ...props
}) => {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      custom={index}
      whileHover={whileHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Dla button/link container
export const AnimatedButtonContainer: FC<AnimatedDivProps> = ({
  children,
  variants = fadeIn,
  initial = "hidden",
  animate = "visible",
  whileHover = { scale: 1.05, transition: { duration: 0.2 } },
  className = "",
  ...props
}) => {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      whileHover={whileHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Dla ikon
export const AnimatedIconContainer: FC<
  AnimatedDivProps & { index?: number }
> = ({
  children,
  index = 0,
  variants = fadeIn,
  initial = "hidden",
  animate = "visible",
  whileHover = { rotate: 5, scale: 1.1, transition: { duration: 0.2 } },
  className = "",
  ...props
}) => {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      custom={index}
      whileHover={whileHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Container z efektem staggered children
export const AnimatedStaggerContainer: FC<AnimatedDivProps> = ({
  children,
  variants = staggerContainer,
  initial = "hidden",
  animate = "visible",
  className = "",
  ...props
}) => {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Efekt pojawienia się elementu z opóźnieniem
export const AnimatedFadeInContainer: FC<
  AnimatedDivProps & { delay?: number }
> = ({ children, delay = 0, className = "", ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
