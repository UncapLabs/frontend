import * as z from "zod";
import { router, publicProcedure } from "../trpc";

export const testRouter = router({
  getWorkerInfo: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input }) => {
      return "Hello, " + input?.name;
    }),
});
