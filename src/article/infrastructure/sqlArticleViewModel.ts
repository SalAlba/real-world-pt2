import { Kysely } from "kysely";
import { DB } from "../../dbTypes";
import { ArticleViewModel } from "../application/articleViewModel";
import { ArticleView } from "./parseArticleOutput";

export const sqlArticleViewModel = (db: Kysely<DB>): ArticleViewModel => {
  return {
    async findArticleBySlug(slug) {
      const result = await db
        .selectFrom("article")
        .where("article.slug", "=", slug)
        .leftJoin("favorite_count", "favorite_count.articleId", "article.id")
        .selectAll()
        .executeTakeFirst();
      if (!result) return null;
      const tags = await db
        .selectFrom("tags")
        .where("tags.articleId", "=", result.id)
        .select(["tags.name"])
        .execute();
      return ArticleView.parse({
        article: {
          ...result,
          favoritesCount: result.count || 0,
          tagList: tags.map((item) => item.name),
        },
      });
    },
  };
};
