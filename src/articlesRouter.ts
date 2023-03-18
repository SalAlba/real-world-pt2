import { Router } from "express";
import makeSlug from "slug";
import omit from "lodash.omit";
import { NotFoundError } from "./NotFoundError";
import merge from "lodash.merge";
import { incrementIdGenerator } from "./incrementIdGenerator";
import { Article } from "./article";
import { inMemoryArticleRepository } from "./inMemoryArticleRepository";
import { createArticle } from "./createArticle";

export const articlesRouter = Router();

const articleIdGenerator = incrementIdGenerator(String);
const articleRepository = inMemoryArticleRepository();

articlesRouter.post("/api/articles", async (req, res, next) => {
  const input = req.body.article;

  const article = await createArticle(
    articleRepository,
    articleIdGenerator
  )(input);

  res.json({ article: omit(article, "id") });
});

articlesRouter.put("/api/articles/:slug", async (req, res, next) => {
  const articleInput = req.body.article;
  const slug = req.params.slug;
  const existingArticle = await articleRepository.findBySlug(slug);
  if (!existingArticle) {
    throw new NotFoundError(`Article with slug ${slug} does not exist`);
  }
  const article = merge(existingArticle, articleInput);
  const now = new Date();
  article.updatedAt = now;
  article.slug = makeSlug(article.title);

  await articleRepository.update(article);
  res.json({ article: omit(article, "id") });
});

articlesRouter.get("/api/articles/:slug", async (req, res, next) => {
  const slug = req.params.slug;

  const existingArticle = await articleRepository.findBySlug(slug);
  if (!existingArticle) {
    throw new NotFoundError(`Article with slug ${slug} does not exist`);
  }
  res.json({ article: omit(existingArticle, "id") });
});
