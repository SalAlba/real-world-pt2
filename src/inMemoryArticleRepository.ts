import {Article, ArticleRepository} from "./article";

export const inMemoryArticleRepository = (): ArticleRepository => {
  const articles: Record<string, Article> = {};

  return {
    async create(article) {
      articles[article.id] = article;
    },
    async update(article) {
      articles[article.id] = article;
    },
    async findBySlug(slug) {
      const article = Object.values(articles).find(
        (article) => article.slug === slug
      );
      return article ?? null;
    },
  };
};
