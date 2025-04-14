"use client";

import { BookOpen, Music, ListTodo, LightbulbIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AnimatedSectionHeading,
  AnimatedSectionDescription,
  AnimatedCard,
  AnimatedIconContainer,
} from "./animated-section-components";

const featureItems = [
  {
    icon: <Music className="h-8 w-8 text-primary" />,
    title: "Upload Media File",
    description:
      "Upload any audio or video file in mp3, wav, ogg, mp4, webm or similar format.",
  },
  {
    icon: <ListTodo className="h-8 w-8 text-primary" />,
    title: "Audio Analysis",
    description:
      "The system automatically analyzes the audio content using AI.",
  },
  {
    icon: <LightbulbIcon className="h-8 w-8 text-primary" />,
    title: "Content Extraction",
    description:
      "Artificial intelligence extracts key information and insights from the audio.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: "Educational Materials",
    description:
      "Based on the analysis, materials such as summaries, notes, and glossaries are created.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-8">
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <AnimatedSectionHeading viewport={{ once: true, amount: 0.3 }}>
            How It Works
          </AnimatedSectionHeading>

          {/* Animowane podkreślenie implementowane w komponencie klienckim */}
          <AnimatedUnderline />
        </div>

        <AnimatedSectionDescription
          viewport={{ once: true, amount: 0.3 }}
          className="text-muted-foreground max-w-2xl mx-auto mt-6"
        >
          Our application uses artificial intelligence to process audio
          recordings and create analysed materials.
        </AnimatedSectionDescription>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {featureItems.map((item, index) => (
          <AnimatedCard
            key={index}
            index={index}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          >
            <Card className="border hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <AnimatedIconContainer
                  className="rounded-full bg-primary/10 p-3 mb-4"
                  index={index}
                  viewport={{ once: true }}
                >
                  {item.icon}
                </AnimatedIconContainer>
                <AnimatedFeatureTitle index={index}>
                  {item.title}
                </AnimatedFeatureTitle>
                <AnimatedFeatureDescription index={index}>
                  {item.description}
                </AnimatedFeatureDescription>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
}

// Komponenty klienckie dla animacji
import { motion } from "framer-motion";

const AnimatedUnderline = () => {
  // Animacja dla podkreślenia tytułu
  const underlineVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "80px",
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Animacja dla kropki podkreślenia
  const dotVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: 1.1,
      },
    },
  };

  return (
    <div className="flex justify-center">
      <div className="relative">
        <motion.div
          className="h-1 bg-primary absolute bottom-0 left-1/2 transform -translate-x-1/2"
          variants={underlineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-primary absolute bottom-0 transform -translate-y-[2px]"
          style={{ right: "-10px" }}
          variants={dotVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        />
      </div>
    </div>
  );
};

const AnimatedFeatureTitle = ({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) => {
  return (
    <motion.h3
      className="font-semibold text-lg mb-2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.h3>
  );
};

const AnimatedFeatureDescription = ({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) => {
  return (
    <motion.p
      className="text-muted-foreground text-sm"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.7 + index * 0.1 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.p>
  );
};
