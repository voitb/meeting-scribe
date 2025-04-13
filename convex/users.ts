import { QueryCtx, MutationCtx } from "./_generated/server";

// Helper function to get the logged-in user's ID
export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    console.log("[convex:users] getUserId: No user identity found");
    return null;
  }
  
  console.log("[convex:users] getUserId: Found user with ID", identity.subject);
  return identity.subject;
}

// Helper function to check if the user is logged in
export async function isUserAuthenticated(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    console.log("[convex:users] isUserAuthenticated: User is NOT authenticated");
    return false;
  }
  
  console.log("[convex:users] isUserAuthenticated: User is authenticated with ID", identity.subject);
  console.log("[convex:users] Token info:", JSON.stringify({
    tokenIdentifier: identity.tokenIdentifier,
    subject: identity.subject
  }));
  
  return true;
}

// Helper function to get the user's identity data
export async function getUserIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    console.log("[convex:users] getUserIdentity: Found user with token identifier", identity.tokenIdentifier);
  } else {
    console.log("[convex:users] getUserIdentity: No user identity found");
  }
  return identity;
} 