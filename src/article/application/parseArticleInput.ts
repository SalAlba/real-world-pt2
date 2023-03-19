import { z } from "zod";

export const ArticleInput = z.object({
  title: z.string().min(1),
  body: z.string(),
  description: z.string(),
  tagList: z.array(z.string()),
});
export type ArticleInput = z.infer<typeof ArticleInput>;

export const UpdateArticleInput = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  description: z.string().optional(),
  tagList: z.array(z.string()).optional(),
});
export type UpdateArticleInput = z.infer<typeof UpdateArticleInput>;
