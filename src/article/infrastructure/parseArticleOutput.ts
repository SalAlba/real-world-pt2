import { z } from "zod";

export const Article = z.object({
    body: z.string(),
    createdAt: z.date(),
    description: z.string(),
    favoritesCount: z.number(),
    slug: z.string(),
    tagList: z.array(z.string()),
    title: z.string(),
    updatedAt: z.date(),
});

export const ArticleView = z.object({
    article: Article,
});
export type ArticleView = z.infer<typeof ArticleView>;