import { createDb } from "./db";
import {
  inMemoryArticlesCompositionRoot,
  sqlArticlesCompositionRoot,
} from "./article/application/articlesCompositionRoot";
import { Config } from "./config";
import { createArticlesRouter } from "./article/api/articlesRouter";
import { transactional } from "./shared/sqlTransaction";
import {
  inMemoryFavoritesCompositionRoot,
  sqlFavoritesCompositionRoot,
} from "./favorite/application/favoriteActionsCompositionRoot";
import { createFavoritesRouter } from "./favorite/api/favoritesRouter";

export const appCompositionRoot = (config: Config) => {
  const db = config.DATABASE_URL ? createDb(config.DATABASE_URL) : null;

  const articleActions = db
    ? sqlArticlesCompositionRoot(db, transactional(db))
    : inMemoryArticlesCompositionRoot();

  const articlesRouter = createArticlesRouter(articleActions);

  const favoriteActions = db
    ? sqlFavoritesCompositionRoot(db)
    : inMemoryFavoritesCompositionRoot(articleActions.articleReadModel);

  const favoritesRouter = createFavoritesRouter(favoriteActions);

  const clean = async () => {
    if (db) {
      await db.deleteFrom("article").execute();
      await db.deleteFrom("favorite_count").execute();
    }
  };

  return { articlesRouter, favoritesRouter, clean };
};
