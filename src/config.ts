import { z } from "zod";

const Config = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().optional(),
});
export type Config = z.infer<typeof Config>;

export const config = Config.parse(process.env);
