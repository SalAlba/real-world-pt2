import type { ColumnType } from "kysely";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Article {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  slug: string;
  title: string;
  body: string;
  description: string;
}

export interface FavoriteCount {
  articleId: string;
  count: number;
}

export interface Tags {
  name: string;
  articleId: string;
}

export interface DB {
  article: Article;
  favorite_count: FavoriteCount;
  tags: Tags;
}
