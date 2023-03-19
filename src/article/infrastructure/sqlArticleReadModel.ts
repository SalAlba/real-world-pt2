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
  };
};
