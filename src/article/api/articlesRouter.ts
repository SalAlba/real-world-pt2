import { Router } from "express";
import omit from "lodash.omit";
import { NotFoundError } from "../../error/NotFoundError";
import {
  ArticleInput,
  UpdateArticleInput,
} from "../application/parseArticleInput";
import { CreateArticle } from "../application/createArticle";
import { UpdateArticle } from "../application/updateArticle";
import { ArticleViewModel } from "../application/articleViewModel";
import {articlePath, articlesPath} from "./paths";

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

  articlesRouter.post(articlesPath.pattern, async (req, res, next) => {
    const input = ArticleInput.parse(req.body.article);

    const article = await create(input);

    res.redirect(articlePath({slug: article.slug}));
  });

  articlesRouter.put(articlePath.pattern, async (req, res, next) => {
    const articleInput = UpdateArticleInput.parse(req.body.article);
    const slug = req.params.slug;

    const article = await update(slug, articleInput);

    res.redirect(articlePath({slug: article.slug}));
  });

  articlesRouter.get(articlePath.pattern, async (req, res, next) => {
    const slug = req.params.slug;

    const existingArticle = await articleViewModel.findArticleBySlug(slug);
    if (!existingArticle) {
      throw new NotFoundError(`Article with slug ${slug} does not exist`);
    }
    res.json(existingArticle);
  });

  return articlesRouter;
};
