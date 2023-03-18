import { Article } from "./article";
import makeSlug from "slug";
import { inMemoryArticleRepository } from "./inMemoryArticleRepository";
import { IdGenerator } from "./idGenerator";

export type ArticleInput = {
  body: string;
  description: string;
  tagList: string[];
  title: string;
};

export const createArticle =
  (
    articleRepository: ReturnType<typeof inMemoryArticleRepository>,
    articleIdGenerator: IdGenerator
  ) =>
  async (input: ArticleInput) => {
    const now = new Date();
    const article: Article = {
      body: input.body,
      description: input.description,
      tagList: input.tagList,
      title: input.title,
      slug: makeSlug(input.title),
      id: articleIdGenerator(),
      createdAt: now,
      updatedAt: now,
    };
    await articleRepository.create(article);
    return article;
  };
