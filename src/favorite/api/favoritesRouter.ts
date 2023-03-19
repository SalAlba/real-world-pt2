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
    res.sendStatus(204);
  });

  app.delete("/api/articles/:slug/favorite", async (req, res, next) => {
    await unfavorite(req.params.slug);
    res.sendStatus(204);
  });

  return app;
};
