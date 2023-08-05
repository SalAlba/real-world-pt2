import {Article, Slug} from "../domain/article";

export type ArticleView = {
  article: Omit<Article, "id"> & { favoritesCount: number };
};

export type ArticleViewModel = {
  findArticleBySlug(slug: Slug): Promise<ArticleView | null>;
};
