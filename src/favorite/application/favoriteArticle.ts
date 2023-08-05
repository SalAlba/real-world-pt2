import { NotFoundError } from "../../error/NotFoundError";
import { FavoritesRepository } from "../domain/favorite";
import { Slug } from "../../article/domain/article";
import { ArticleReadModel } from "../../article/application/articleReadModel";

export type FavoriteArticle = (articleSlug: Slug) => Promise<void>;
export const favoriteArticle =
  (
    articleReadModel: ArticleReadModel,
    favoritesRepository: FavoritesRepository
  ): FavoriteArticle =>
  async (articleSlug) => {
    const existingArticle = await articleReadModel.findArticleIdBySlug(
      articleSlug
    );
    if (!existingArticle) {
      throw new NotFoundError(
        `Article with slug ${articleSlug} does not exist`
      );
    }
    const count = await favoritesRepository.find(existingArticle);
    await favoritesRepository.update({
      articleId: existingArticle,
      count: count + 1,
    });
  };

export type UnfavoriteArticle = (articleSlug: Slug) => Promise<void>;
export const unfavoriteArticle =
  (
    articleReadModel: ArticleReadModel,
    favoritesRepository: FavoritesRepository
  ): UnfavoriteArticle =>
  async (articleSlug) => {
    const existingArticle = await articleReadModel.findArticleIdBySlug(
      articleSlug
    );
    if (!existingArticle) {
      throw new NotFoundError(
        `Article with slug ${articleSlug} does not exist`
      );
    }
    const count = await favoritesRepository.find(existingArticle);
    await favoritesRepository.update({
      articleId: existingArticle,
      count: count - 1,
    });
  };
