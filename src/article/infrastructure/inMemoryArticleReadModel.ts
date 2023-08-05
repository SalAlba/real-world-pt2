import { ArticleRepository } from "../domain/article";
import { ArticleReadModel } from "../application/articleReadModel";

export const inMemoryArticleReadModel = (
  articleRepository: ArticleRepository
): ArticleReadModel => {
  return {
    async findArticleIdBySlug(slug) {
      const result = await articleRepository.findBySlug(slug);
      return result ? result.id : null;
    },
  };
};
