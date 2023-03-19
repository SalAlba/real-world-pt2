import { Kysely } from "kysely";
import { DB } from "../../dbTypes";
import { FavoritesRepository } from "../domain/favorite";

export const sqlFavoritesRepository = (db: Kysely<DB>): FavoritesRepository => {
  return {
    async update({ articleId, count }) {
      await db
        .updateTable("favorite_count")
        .set({ articleId, count })
        .where("favorite_count.articleId", "=", articleId)
        .execute();
    },
    async find(articleId) {
      const result = await db
        .selectFrom("favorite_count")
        .select("count")
        .where("favorite_count.articleId", "=", articleId)
        .executeTakeFirst();
      return result ? result.count : 0;
    },
  };
};
