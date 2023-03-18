import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { NotFoundError } from "./NotFoundError";
import makeSlug from "slug";
import { incrementIdGenerator } from "./incrementIdGenerator";
import omit from "lodash.omit";
import merge from "lodash.merge";

type Article = {
  body: string;
  description: string;
  tagList: Array<string>;
  title: string;
  slug: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
const articleIdGenerator = incrementIdGenerator(String);
const articles: Record<string, Article> = {};

export const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/articles", async (req, res, next) => {
  const input = req.body.article;

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
  articles[article.id] = article;

  res.json({ article: omit(article, "id") });
});

app.put("/api/articles/:slug", async (req, res, next) => {
  const articleInput = req.body.article;
  const slug = req.params.slug;
  const existingArticle = Object.values(articles).find(
    (article) => article.slug === slug
  );
  if (!existingArticle) {
    throw new NotFoundError(`Article with slug ${slug} does not exist`);
  }
  const article = merge(existingArticle, articleInput);
  const now = new Date();
  article.updatedAt = now;
  article.slug = makeSlug(article.title);

  articles[article.id] = article;
  res.json({ article: omit(article, "id") });
});

app.get("/api/articles/:slug", async (req, res, next) => {
  const slug = req.params.slug;

  const existingArticle = Object.values(articles).find(
    (article) => article.slug === slug
  );
  if (!existingArticle) {
    throw new NotFoundError(`Article with slug ${slug} does not exist`);
  }
  res.json({ article: omit(existingArticle, "id") });
});

app.use((req, res, next) => {
  throw new NotFoundError();
});
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ errors: err.message });
  }
  console.error(err);
  res.sendStatus(500);
};
app.use(errorHandler);
