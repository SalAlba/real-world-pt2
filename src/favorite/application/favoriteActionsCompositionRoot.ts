import { Kysely } from "kysely";
import { DB } from "../../dbTypes";
import { favoriteArticle, unfavoriteArticle } from "./favoriteArticle";
import { sqlFavoritesRepository } from "../infrastructure/sqlFavoritesRepository";
import { sqlArticleRepository } from "../../article/infrastructure/sqlArticleRepository";
import { ArticleRepository } from "../../article/domain/article";
import { inMemoryFavoritesRepository } from "../infrastructure/inMemoryFavoritesRepository";

export const sqlFavoritesCompositionRoot = (db: Kysely<DB>) => {
  const articleRepository = sqlArticleRepository(db);
  const favoritesRepository = sqlFavoritesRepository(db);
  return {
    favorite: favoriteArticle(articleRepository, favoritesRepository),
    unfavorite: unfavoriteArticle(articleRepository, favoritesRepository),
  };
};

export const inMemoryFavoritesCompositionRoot = (
  articleRepository: ArticleRepository
) => {
  const favoritesRepository = inMemoryFavoritesRepository();
  return {
    favorite: favoriteArticle(articleRepository, favoritesRepository),
    unfavorite: unfavoriteArticle(articleRepository, favoritesRepository),
  };
};
