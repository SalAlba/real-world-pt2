import { Router } from "express";
import omit from "lodash.omit";
import { NotFoundError } from "../../error/NotFoundError";
import {
  ArticleInput,
  UpdateArticleInput,
} from "../application/parseArticleInput";
import { CreateArticle } from "../application/createArticle";
import { ArticleRepository } from "../domain/article";
import { UpdateArticle } from "../application/updateArticle";

export const createArticlesRouter = ({
  create,
  update,
  articleRepository,
}: {
  create: CreateArticle;
  update: UpdateArticle;
  articleRepository: ArticleRepository;
}) => {
  const articlesRouter = Router();

  articlesRouter.post("/api/articles", async (req, res, next) => {
    const input = ArticleInput.parse(req.body.article);

    const article = await create(input);

    res.json({ article: omit(article, "id") });
  });

  articlesRouter.put("/api/articles/:slug", async (req, res, next) => {
    const articleInput = UpdateArticleInput.parse(req.body.article);
    const slug = req.params.slug;

    const article = await update(slug, articleInput);

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

  return articlesRouter;
};
