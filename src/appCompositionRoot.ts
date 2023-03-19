import { createDb } from "./db";
import {
  inMemoryArticlesCompositionRoot,
  sqlArticlesCompositionRoot,
} from "./article/application/articlesCompositionRoot";
import { Config } from "./config";
import { createArticlesRouter } from "./article/api/articlesRouter";
import { transactional } from "./shared/sqlTransaction";

export const appCompositionRoot = (config: Config) => {
  const db = config.DATABASE_URL ? createDb(config.DATABASE_URL) : null;

  const articleActions = db
    ? sqlArticlesCompositionRoot(db, transactional(db))
    : inMemoryArticlesCompositionRoot();

  const articlesRouter = createArticlesRouter(articleActions);

  const clean = async () => {
    if (db) {
      await db.deleteFrom("article").execute();
    }
  };

  return { articlesRouter, clean };
};
