import { ArticleRepository } from "../domain/article";
import { ArticleReadModel } from "./articleReadModel";
import { FavoritesRepository } from "../../favorite/domain/favorite";

export const inMemoryArticleReadModel = (
  articleRepository: ArticleRepository,
  favoritesRepository: FavoritesRepository
): ArticleReadModel => {
  return {
    async findArticleIdBySlug(slug) {
      const result = await articleRepository.findBySlug(slug);
      return result ? result.id : null;
    },
    async findArticleBySlug(slug) {
      const result = await articleRepository.findBySlug(slug);
      if (!result) return null;
      const favorites = await favoritesRepository.find(result.id);
      return { article: { ...result, favoritesCount: favorites } };
    },
  };
};
