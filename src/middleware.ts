import { clerkMiddleware } from "@clerk/nextjs/server";

// Używamy podstawowego middleware Clerk bez konfiguracji
// Trasy publiczne można skonfigurować w pliku .env poprzez CLERK_PUBLISHABLE_KEY
export default clerkMiddleware();

export const config = {
  // Middleware działa na wszystkich stronach poza statycznymi zasobami
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 