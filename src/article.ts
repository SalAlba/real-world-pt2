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