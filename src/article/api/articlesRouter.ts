import { Router } from "express";
import omit from "lodash.omit";
import { NotFoundError } from "../../error/NotFoundError";
import {
  ArticleInput,
  UpdateArticleInput,
} from "../application/parseArticleInput";
import { CreateArticle } from "../application/createArticle";
import { UpdateArticle } from "../application/updateArticle";
import { ArticleReadModel } from "../application/articleReadModel";
import { ArticleViewModel } from "../application/articleViewModel";

export const createArticlesRouter = ({
  create,
  update,
  articleViewModel,
}: {
  create: CreateArticle;
  update: UpdateArticle;
  articleViewModel: ArticleViewModel;
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

    const existingArticle = await articleViewModel.findArticleBySlug(slug);
    if (!existingArticle) {
      throw new NotFoundError(`Article with slug ${slug} does not exist`);
    }
    res.json(existingArticle);
  });

  return articlesRouter;
};
