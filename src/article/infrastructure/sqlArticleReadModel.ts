import { Slug } from "../domain/article";
import { Kysely } from "kysely";
import { DB } from "../../dbTypes";
import { ArticleReadModel } from "./articleReadModel";

export const sqlArticleReadModel = (db: Kysely<DB>): ArticleReadModel => {
  return {
    async findArticleIdBySlug(slug) {
      const result = await db
        .selectFrom("article")
        .where("article.slug", "=", slug)
        .select("article.id")
        .executeTakeFirst();
      return result ? result.id : null;
    },
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
      return {
        article: {
          ...result,
          favoritesCount: result.count || 0,
          tagList: tags.map((item) => item.name),
        },
      };
    },
  };
};
