import { ArticleRepository } from "../domain/article";
import { Kysely } from "kysely";
import { DB } from "../../dbTypes";

export const sqlArticleRepository = (db: Kysely<DB>): ArticleRepository => {
  return {
    async create(article) {
      const { tagList, ...cleanArticle } = article;
      await db.insertInto("article").values(cleanArticle).execute();
      if (tagList.length > 0) {
        await db
          .insertInto("tags")
          .values(tagList.map((name) => ({ name, articleId: cleanArticle.id })))
          .execute();
      }
    },
    async update(article) {
      const { tagList, updatedAt, slug, title, body, description } = article;
      await db
        .updateTable("article")
        .set({ updatedAt, slug, title, body, description })
        .where("article.id", "=", article.id)
        .execute();
      await db
        .deleteFrom("tags")
        .where("tags.articleId", "=", article.id)
        .execute();
      if (tagList.length > 0) {
        await db
          .insertInto("tags")
          .values(tagList.map((name) => ({ name, articleId: article.id })))
          .execute();
      }
    },
    async findBySlug(slug) {
      const article = await db
        .selectFrom("article")
        .where("slug", "=", slug)
        .selectAll()
        .executeTakeFirst();
      if (!article) return null;
      const tags = await db
        .selectFrom("tags")
        .where("tags.articleId", "=", article.id)
        .select(["tags.name"])
        .execute();
      return {
        ...article,
        tagList: tags.map((item) => item.name),
      };
    },
  };
};
