import { uuidGenerator } from "../../shared/uuidGenerator";
import { incrementIdGenerator } from "../../shared/incrementIdGenerator";
import { sqlArticleRepository } from "../infrastructure/sqlArticleRepository";
import { createArticle } from "./createArticle";
import { now } from "../../shared/clock";
import { updateArticle } from "./updateArticle";
import { Kysely, Transaction } from "kysely";
import { DB } from "../../dbTypes";
import { WithTx } from "../../shared/sqlTransaction";
import { ArticleRepository } from "../domain/article";

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
  return {
    create: withTxDb(create),
    update: withTxDb(update),
  };
};

export const inMemoryArticlesCompositionRoot = (
  articleRepository: ArticleRepository
) => {
  const articleIdGenerator = incrementIdGenerator(String);
  const create = createArticle(articleRepository, articleIdGenerator, now);
  const update = updateArticle(articleRepository, now);

  return { create, update };
};
