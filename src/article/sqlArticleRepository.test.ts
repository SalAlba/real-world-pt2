import { createDb } from "../db";
import { sqlArticleRepository } from "./sqlArticleRepository";
import { articleRepositoryContract } from "./articleRepositoryContract.test";

const db = createDb("postgres://user:secret@localhost:5432/conduit");

const clean = async () => {
  await db.deleteFrom("article").execute();
};

articleRepositoryContract(
  "SQL",
  () => {
    return sqlArticleRepository(db);
  },
  clean
);
