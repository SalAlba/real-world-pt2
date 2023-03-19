export type Tag = string;
export type ArticleId = string;
export type Slug = string;

export type Article = {
  body: string;
  description: string;
  tagList: Array<Tag>;
  title: string;
  slug: Slug;
  id: ArticleId;
  createdAt: Date;
  updatedAt: Date;
};

export type ArticleRepository = {
  create(article: Article): Promise<void>;
  update(article: Article): Promise<void>;
  findBySlug(slug: string): Promise<Article | null>;
};
