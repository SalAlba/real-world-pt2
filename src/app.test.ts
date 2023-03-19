import httpClient from "supertest";
import { createApp } from "./app";
import assert from "assert";
import omit from "lodash.omit";

type ArticleInput = {
  title: string;
  description: string;
  tagList: Array<string>;
  body: string;
};
type Request = ReturnType<typeof httpClient>;

const createArticle = (request: Request, article: ArticleInput, status = 200) =>
  request
    .post("/api/articles")
    .send({
      article,
    })
    .expect(status);

const updateArticle = (request: Request, slug: string, article: ArticleInput) =>
  request
    .post("/api/articles")
    .send({
      article,
    })
    .expect(200);

const getArticle = (request: Request, slug: string) =>
  request.get(`/api/articles/${slug}`).expect(200);

const favoriteArticle = (request: Request, slug: string) =>
  request.post(`/api/articles/${slug}/favorite`).expect(204);
const unfavoriteArticle = (request: Request, slug: string) =>
  request.delete(`/api/articles/${slug}/favorite`).expect(204);

describe("Conduit", function () {
  it("Favorite article", async function () {
    const { app, clean } = createApp({
      PORT: 3000,
      DATABASE_URL: "postgres://user:secret@localhost:5432/conduit",
    });
    const request = httpClient(app);
    await clean();

    const createdArticle = await createArticle(request, {
      title: "The title",
      description: "description",
      tagList: ["tag1", "tag2"],
      body: "body",
    });

    await favoriteArticle(request, createdArticle.body.article.slug);
    await unfavoriteArticle(request, createdArticle.body.article.slug);
  });
  it("Article creation journey", async function () {
    const { app, clean } = createApp({
      PORT: 3000,
      DATABASE_URL: "postgres://user:secret@localhost:5432/conduit",
    });
    const request = httpClient(app);
    await clean();

    const createdArticle = await createArticle(request, {
      title: "The title",
      description: "description",
      tagList: ["tag1", "tag2"],
      body: "body",
      // @ts-ignore
      invalidField: "ignore me",
    });

    assert.deepStrictEqual(
      omit(createdArticle.body.article, "createdAt", "updatedAt"),
      {
        body: "body",
        description: "description",
        slug: "the-title",
        tagList: ["tag1", "tag2"],
        title: "The title",
      }
    );

    const articleResult = await getArticle(request, "the-title");

    assert.deepStrictEqual(
      omit(articleResult.body.article, "createdAt", "updatedAt"),
      {
        body: "body",
        description: "description",
        tagList: ["tag1", "tag2"],
        title: "The title",
        slug: "the-title",
      }
    );

    const updatedArticle = await updateArticle(request, "the-title", {
      title: "The title updated",
      description: "description updated",
      tagList: ["tag1", "tag3"],
      body: "body updated",
    });

    assert.deepStrictEqual(
      omit(updatedArticle.body.article, "createdAt", "updatedAt"),
      {
        body: "body updated",
        description: "description updated",
        tagList: ["tag1", "tag3"],
        title: "The title updated",
        slug: "the-title-updated",
      }
    );

    const failedArticle = await createArticle(
      request,
      // @ts-ignore
      {
        title: "",
      },
      422
    );

    assert.deepStrictEqual(failedArticle.body.errors.length, 4);
  });
});
