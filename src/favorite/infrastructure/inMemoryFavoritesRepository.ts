import { FavoritesRepository } from "../domain/favorite";
import { ArticleId } from "../../article/domain/article";

export const inMemoryFavoritesRepository = (): FavoritesRepository => {
  const favorites: Record<ArticleId, number> = {};

  return {
    async update(count) {
      favorites[count.articleId] = count.count;
    },
    async find(articleId) {
      return favorites[articleId] || 0;
    },
  };
};
