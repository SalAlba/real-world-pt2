import { Router } from "express";
import {
  FavoriteArticle,
  UnfavoriteArticle,
} from "../application/favoriteArticle";

export const createFavoritesRouter = ({
  favorite,
  unfavorite,
}: {
  favorite: FavoriteArticle;
  unfavorite: UnfavoriteArticle;
}) => {
  const app = Router();

  app.post("/api/articles/:slug/favorite", async (req, res, next) => {
    await favorite(req.params.slug);
    res.redirect(`/api/articles/${req.params.slug}`);
  });

  app.delete("/api/articles/:slug/favorite", async (req, res, next) => {
    await unfavorite(req.params.slug);
    res.redirect(`/api/articles/${req.params.slug}`);
  });

  return app;
};
