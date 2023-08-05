import { Kysely } from "kysely";
import { DB } from "../../dbTypes";
import { favoriteArticle, unfavoriteArticle } from "./favoriteArticle";
import { sqlFavoritesRepository } from "../infrastructure/sqlFavoritesRepository";
import { inMemoryFavoritesRepository } from "../infrastructure/inMemoryFavoritesRepository";
import { ArticleReadModel } from "../../article/application/articleReadModel";
import { sqlArticleReadModel } from "../../article/infrastructure/sqlArticleReadModel";

export const sqlFavoritesCompositionRoot = (db: Kysely<DB>) => {
  const articleReadModel = sqlArticleReadModel(db);
  const favoritesRepository = sqlFavoritesRepository(db);
  return {
    favorite: favoriteArticle(articleReadModel, favoritesRepository),
    unfavorite: unfavoriteArticle(articleReadModel, favoritesRepository),
  };
};

export const inMemoryFavoritesCompositionRoot = (
  articleReadModel: ArticleReadModel
) => {
  const favoritesRepository = inMemoryFavoritesRepository();
  return {
    favorite: favoriteArticle(articleReadModel, favoritesRepository),
    unfavorite: unfavoriteArticle(articleReadModel, favoritesRepository),
  };
};
