"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function RecentVideosSection() {
  // Fetch all video analyses from database
  const allVideos = useQuery(api.videos.getAllVideoAnalyses);

  // Animation for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Animation for each item
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Get 3 most recently analyzed videos (sorted by analysis date)
  const recentVideos = allVideos
    ? [...allVideos]
        .sort(
          (a, b) =>
            new Date(b.analysisDate).getTime() -
            new Date(a.analysisDate).getTime()
        )
        .slice(0, 3)
    : [];

  if (!allVideos || recentVideos.length === 0) {
    return null;
  }

  // Function to extract video ID from YouTube URL
  const getVideoIdFromUrl = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <section className="mt-16">
      <motion.h2
        className="text-3xl font-bold text-foreground mb-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Recently Analyzed Content
      </motion.h2>

      <motion.div
        className="grid gap-8 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {recentVideos.map((video) => {
          const videoId = getVideoIdFromUrl(video.url);
          const thumbnailUrl = video.thumbnail;

          return (
            <motion.div
              key={video._id?.toString() || video.url}
              variants={itemVariants}
              className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={thumbnailUrl}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <Link href={`/result/${videoId}`} className="block group">
                  <h3 className="text-lg font-medium mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                </Link>
                <div className="flex items-center mb-3 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    {new Date(video.analysisDate).toLocaleDateString("en-US")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {video.summary}
                </p>
                <Link
                  href={`/result/${videoId}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  View Details
                  <ExternalLink className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
