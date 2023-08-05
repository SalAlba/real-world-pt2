import {createDb} from "./db";
import {
  inMemoryArticlesCompositionRoot,
  sqlArticlesCompositionRoot,
} from "./article/application/articlesCompositionRoot";
import {Config} from "./config";
import {createArticlesRouter} from "./article/api/articlesRouter";
import {transactional} from "./shared/sqlTransaction";
import {
  inMemoryFavoritesCompositionRoot,
  sqlFavoritesCompositionRoot,
} from "./favorite/application/favoriteActionsCompositionRoot";
import {createFavoritesRouter} from "./favorite/api/favoritesRouter";
import {inMemoryArticleRepository} from "./article/infrastructure/inMemoryArticleRepository";
import {inMemoryFavoritesRepository} from "./favorite/infrastructure/inMemoryFavoritesRepository";
import {inMemoryArticleReadModel} from "./article/infrastructure/inMemoryArticleReadModel";
import {sqlArticleViewModel} from "./article/infrastructure/sqlArticleViewModel";
import {inMemoryArticleViewModel} from "./article/infrastructure/inMemoryArticleViewModel";

export const appCompositionRoot = (config: Config) => {
  const db = config.DATABASE_URL ? createDb(config.DATABASE_URL) : null;

  if (db) {
    const clean = async () => {
      await db.deleteFrom("article").execute();
      await db.deleteFrom("favorite_count").execute();
    };
    const articleActions = sqlArticlesCompositionRoot(db, transactional(db));
    const favoriteActions = sqlFavoritesCompositionRoot(db);
    const articleViewModel = sqlArticleViewModel(db);
    return {
      articlesRouter: createArticlesRouter({
        ...articleActions,
        articleViewModel,
      }),
      favoritesRouter: createFavoritesRouter(favoriteActions),
      clean,
    };
  } else {
    const articleRepository = inMemoryArticleRepository();
    const favoritesRepository = inMemoryFavoritesRepository();
    const articleViewModel = inMemoryArticleViewModel(
      articleRepository,
      favoritesRepository
    );
    const articleReadModel = inMemoryArticleReadModel(articleRepository);
    const articleActions = inMemoryArticlesCompositionRoot(articleRepository);
    const favoriteActions = inMemoryFavoritesCompositionRoot(articleReadModel);
    return {
      articlesRouter: createArticlesRouter({
        ...articleActions,
        articleViewModel,
      }),
      favoritesRouter: createFavoritesRouter(favoriteActions),
      clean: () => {},
    };
  }
};
