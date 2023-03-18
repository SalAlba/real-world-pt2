import httpClient from "supertest";
import { app } from "./app";
import assert from "assert";
import omit from "lodash.omit";

type ArticleInput = {
  title: string;
  description: string;
  tagList: Array<string>;
  body: string;
};
type Request = ReturnType<typeof httpClient>;

const createArticle = (request: Request, article: ArticleInput) =>
  request
    .post("/api/articles")
    .send({
      article,
    })
    .expect(200);

const updateArticle = (request: Request, slug: string, article: ArticleInput) =>
  request
    .post("/api/articles")
    .send({
      article,
    })
    .expect(200);

const getArticle = (request: Request, slug: string) =>
  request.get(`/api/articles/${slug}`).expect(200);

describe("Conduit", function () {
  it("Article creation journey", async function () {
    const request = httpClient(app);

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
  });
});