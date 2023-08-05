import { ArticleRepository } from "../domain/article";
import { ArticleViewModel } from "../application/articleViewModel";
import { FavoritesRepository } from "../../favorite/domain/favorite";

export const inMemoryArticleViewModel = (
  articleRepository: ArticleRepository,
  favoritesRepository: FavoritesRepository
): ArticleViewModel => {
  return {
    async findArticleBySlug(slug) {
      const result = await articleRepository.findBySlug(slug);
      if (!result) return null;
      const favorites = await favoritesRepository.find(result.id);
      return { article: { ...result, favoritesCount: favorites } };
    },
  };
};
