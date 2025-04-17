"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Download } from "lucide-react";

export function FeaturesSection() {
	const featureVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: i * 0.1,
				duration: 0.5,
			},
		}),
	};

	const features = [
		{
			icon: <BookOpen className="h-6 w-6 text-foreground" />,
			title: "Smart Summaries",
			description: "Generate concise summaries of your meetings",
		},
		{
			icon: (
				<svg
					className="h-6 w-6 text-foreground"
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
			),
			title: "Key Points Extraction",
			description:
				"Automatically identify and extract the most important concepts and information",
		},
		{
			icon: <Clock className="h-6 w-6 text-foreground" />,
			title: "Time Chapters",
			description:
				"Divide into logical sections with timestamps for easy navigation",
		},
		{
			icon: <Download className="h-6 w-6 text-foreground" />,
			title: "PDF Export",
			description:
				"Save all materials in a convenient format for offline use and sharing",
		},
	];

	return (
		<motion.section
			className="bg-card rounded-xl p-10 shadow-md border"
			initial={{ opacity: 0, y: 50 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.7 }}
		>
			<motion.h2
				className="text-3xl font-bold text-card-foreground mb-10 text-center"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				Features
			</motion.h2>
			<div className="grid md:grid-cols-2 gap-8">
				{features.map((feature, i) => (
					<motion.div
						key={i}
						className="flex items-start"
						custom={i}
						variants={featureVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						whileHover={{ x: 5 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						<motion.div
							className="bg-accent/70 rounded-full p-3 mr-4"
							whileHover={{ scale: 1.1, rotate: 5 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							{feature.icon}
						</motion.div>
						<div>
							<h3 className="text-lg font-semibold text-card-foreground mb-2">
								{feature.title}
							</h3>
							<p className="text-muted-foreground">{feature.description}</p>
						</div>
					</motion.div>
				))}
			</div>
		</motion.section>
	);
}
