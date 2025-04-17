import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "MeetingScribe | AI Meeting Notes",
	description: "Transform audio recordings into meeting notes with AI analysis",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.className} overflow-x-hidden`}>
				<ThemeProvider defaultTheme="dark">
					<AuthProvider>
						<Toaster richColors position="top-center" />
						{children}
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
