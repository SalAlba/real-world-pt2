import {Article} from "./article";

export const inMemoryArticleRepository = () => {
  const articles: Record<string, Article> = {};

  return {
    async create(article: Article): Promise<void> {
      articles[article.id] = article;
    },
    async update(article: Article): Promise<void> {
      articles[article.id] = article;
    },
    async findBySlug(slug: string): Promise<Article | null> {
      const article = Object.values(articles).find(
        (article) => article.slug === slug
      );
      return article ?? null;
    },
  };
};
