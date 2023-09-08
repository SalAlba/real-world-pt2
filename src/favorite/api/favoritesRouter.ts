import { Router } from "express";
import {
  FavoriteArticle,
  UnfavoriteArticle,
} from "../application/favoriteArticle";
import {favoritePath} from "./paths";
import {articlePath} from "../../article/api/paths";

export const createFavoritesRouter = ({
  favorite,
  unfavorite,
}: {
  favorite: FavoriteArticle;
  unfavorite: UnfavoriteArticle;
}) => {
  const app = Router();

  app.post(favoritePath.pattern, async (req, res, next) => {
    await favorite(req.params.slug);
    res.redirect(articlePath({ slug: req.params.slug }));
  });

  app.delete(favoritePath.pattern, async (req, res, next) => {
    await unfavorite(req.params.slug);
    res.redirect(articlePath({ slug: req.params.slug }));
  });

  return app;
};
