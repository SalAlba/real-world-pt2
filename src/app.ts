import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./error/errorHandler";
import { Config } from "./config";
import { appCompositionRoot } from "./appCompositionRoot";

export const createApp = (config: Config) => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const { articlesRouter, clean } = appCompositionRoot(config);
  app.use(articlesRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, clean };
};
