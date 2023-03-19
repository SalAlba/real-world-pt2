import { NotFoundError } from "../../error/NotFoundError";
import { FavoritesRepository } from "../domain/favorite";
import { ArticleRepository, Slug } from "../../article/domain/article";

export type FavoriteArticle = (articleSlug: Slug) => Promise<void>;
export const favoriteArticle =
  (
    articleRepository: ArticleRepository,
    favoritesRepository: FavoritesRepository
  ): FavoriteArticle =>
  async (articleSlug) => {
    const existingArticle = await articleRepository.findBySlug(articleSlug);
    if (!existingArticle) {
      throw new NotFoundError(
        `Article with slug ${articleSlug} does not exist`
      );
    }
    const count = await favoritesRepository.find(existingArticle.id);
    await favoritesRepository.update({
      articleId: existingArticle.id,
      count: count + 1,
    });
  };

export type UnfavoriteArticle = (articleSlug: Slug) => Promise<void>;
export const unfavoriteArticle =
  (
    articleRepository: ArticleRepository,
    favoritesRepository: FavoritesRepository
  ): UnfavoriteArticle =>
  async (articleSlug) => {
    const existingArticle = await articleRepository.findBySlug(articleSlug);
    if (!existingArticle) {
      throw new NotFoundError(
        `Article with slug ${articleSlug} does not exist`
      );
    }
    const count = await favoritesRepository.find(existingArticle.id);
    await favoritesRepository.update({
      articleId: existingArticle.id,
      count: count - 1,
    });
  };
