import { uuidGenerator } from "./uuidGenerator";
import { incrementIdGenerator } from "./incrementIdGenerator";
import { sqlArticleRepository } from "./sqlArticleRepository";
import { inMemoryArticleRepository } from "./inMemoryArticleRepository";
import { createArticle } from "./createArticle";
import { now } from "./clock";
import { updateArticle } from "./updateArticle";
import { Kysely } from "kysely";
import { DB } from "./dbTypes";

export const sqlArticlesCompositionRoot = (db: Kysely<DB>) => {
  const articleIdGenerator = uuidGenerator;
  const articleRepository = sqlArticleRepository(db);
  const create = createArticle(articleRepository, articleIdGenerator, now);
  const update = updateArticle(articleRepository, now);

  return { create, update, articleRepository };
};

export const inMemoryArticlesCompositionRoot = () => {
  const articleIdGenerator = incrementIdGenerator(String);
  const articleRepository = inMemoryArticleRepository();
  const create = createArticle(articleRepository, articleIdGenerator, now);
  const update = updateArticle(articleRepository, now);

  return { create, update, articleRepository };
};
