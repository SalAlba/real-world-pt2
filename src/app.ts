import express from "express";
import cors from "cors";
import { createArticlesRouter } from "./article/api/articlesRouter";
import { errorHandler, notFoundHandler } from "./error/errorHandler";
import { Config } from "./config";
import { createDb } from "./db";
import {
  inMemoryArticlesCompositionRoot,
  sqlArticlesCompositionRoot,
} from "./article/application/articlesCompositionRoot";

export const createApp = (config: Config) => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const db = config.DATABASE_URL ? createDb(config.DATABASE_URL) : null;
  const articleActions = db
    ? sqlArticlesCompositionRoot(db)
    : inMemoryArticlesCompositionRoot();
  app.use(createArticlesRouter(articleActions));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
