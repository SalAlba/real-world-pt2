import { uuidGenerator } from "../../shared/uuidGenerator";
import { incrementIdGenerator } from "../../shared/incrementIdGenerator";
import { sqlArticleRepository } from "../infrastructure/sqlArticleRepository";
import { inMemoryArticleRepository } from "../infrastructure/inMemoryArticleRepository";
import { createArticle } from "./createArticle";
import { now } from "../../shared/clock";
import { updateArticle } from "./updateArticle";
import { Kysely, Transaction } from "kysely";
import { DB } from "../../dbTypes";
import { WithTx } from "../../shared/sqlTransaction";

const create = (db: Transaction<DB>) => {
  const articleRepository = sqlArticleRepository(db);

  return createArticle(articleRepository, uuidGenerator, now);
};

const update = (db: Transaction<DB>) => {
  const articleRepository = sqlArticleRepository(db);

  return updateArticle(articleRepository, now);
};

export const sqlArticlesCompositionRoot = (
  db: Kysely<DB>,
  withTxDb: WithTx<DB>
) => {
  const articleRepository = sqlArticleRepository(db);

  return {
    create: withTxDb(create),
    update: withTxDb(update),
    articleRepository,
  };
};

export const inMemoryArticlesCompositionRoot = () => {
  const articleIdGenerator = incrementIdGenerator(String);
  const articleRepository = inMemoryArticleRepository();
  const create = createArticle(articleRepository, articleIdGenerator, now);
  const update = updateArticle(articleRepository, now);

  return { create, update, articleRepository };
};
