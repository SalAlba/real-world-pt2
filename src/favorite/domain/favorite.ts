import { ArticleId } from "../../article/domain/article";

type FavoriteCount = {
  articleId: ArticleId;
  count: number;
};

export type FavoritesRepository = {
  update(count: FavoriteCount): Promise<void>;
  find(articleId: ArticleId): Promise<number>;
};
