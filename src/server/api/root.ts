
import { createTRPCRouter } from "@/server/api/trpc";
import { predictionRouter } from "./routers/predication";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  prediction: predictionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
