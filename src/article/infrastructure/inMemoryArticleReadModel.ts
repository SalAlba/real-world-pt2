import { ArticleRepository } from "../domain/article";
import { ArticleReadModel } from "./articleReadModel";

export const inMemoryArticleReadModel = (
  repository: ArticleRepository
): ArticleReadModel => {
  return {
    async findArticleIdBySlug(slug) {
      const result = await repository.findBySlug(slug);
      return result ? result.id : null;
    },
  };
};
