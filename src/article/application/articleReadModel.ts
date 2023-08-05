import { ArticleId, Slug } from "../domain/article";

export type ArticleReadModel = {
  findArticleIdBySlug(slug: Slug): Promise<ArticleId | null>;
};
