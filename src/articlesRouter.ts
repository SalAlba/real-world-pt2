import {Router} from "express";
import makeSlug from "slug";
import omit from "lodash.omit";
import {NotFoundError} from "./NotFoundError";
import merge from "lodash.merge";
import {incrementIdGenerator} from "./incrementIdGenerator";

export const articlesRouter = Router();

type Article = {
    body: string;
    description: string;
    tagList: Array<string>;
    title: string;
    slug: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
};
const articleIdGenerator = incrementIdGenerator(String);
const articles: Record<string, Article> = {};

articlesRouter.post("/api/articles", async (req, res, next) => {
    const input = req.body.article;

    const now = new Date();
    const article: Article = {
        body: input.body,
        description: input.description,
        tagList: input.tagList,
        title: input.title,
        slug: makeSlug(input.title),
        id: articleIdGenerator(),
        createdAt: now,
        updatedAt: now,
    };
    articles[article.id] = article;

    res.json({ article: omit(article, "id") });
});

articlesRouter.put("/api/articles/:slug", async (req, res, next) => {
    const articleInput = req.body.article;
    const slug = req.params.slug;
    const existingArticle = Object.values(articles).find(
        (article) => article.slug === slug
    );
    if (!existingArticle) {
        throw new NotFoundError(`Article with slug ${slug} does not exist`);
    }
    const article = merge(existingArticle, articleInput);
    const now = new Date();
    article.updatedAt = now;
    article.slug = makeSlug(article.title);

    articles[article.id] = article;
    res.json({ article: omit(article, "id") });
});

articlesRouter.get("/api/articles/:slug", async (req, res, next) => {
    const slug = req.params.slug;

    const existingArticle = Object.values(articles).find(
        (article) => article.slug === slug
    );
    if (!existingArticle) {
        throw new NotFoundError(`Article with slug ${slug} does not exist`);
    }
    res.json({ article: omit(existingArticle, "id") });
});