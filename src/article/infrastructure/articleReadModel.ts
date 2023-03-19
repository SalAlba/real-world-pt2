import { Article, ArticleId, Slug } from "../domain/article";

export type ArticleView = {
  article: Omit<Article, "id"> & { favoritesCount: number };
};

export type ArticleReadModel = {
  findArticleIdBySlug(slug: Slug): Promise<ArticleId | null>;
  findArticleBySlug(slug: Slug): Promise<ArticleView | null>;
};
