import { createArticle } from "./createArticle";
import assert from "assert";
import { inMemoryArticleRepository } from "../infrastructure/inMemoryArticleRepository";
import omit from "lodash.omit";

describe("Create article", function () {
  it("happy path", async function () {
    const articleRepository = inMemoryArticleRepository();
    const idGenerator = () => "articleId";
    const DATE = new Date(2010, 10, 10);
    const clock = () => DATE;
    const create = createArticle(articleRepository, idGenerator, clock);

    const article = await create({
      title: "The title",
      body: "body",
      description: "",
      tagList: ["tag1", "tag2"],
    });

    const fetchedArticle = await articleRepository.findBySlug(article.slug);

    assert.deepStrictEqual(fetchedArticle, {
      body: "body",
      createdAt: DATE,
      updatedAt: DATE,
      description: "",
      id: "articleId",
      slug: "the-title",
      tagList: ["tag1", "tag2"],
      title: "The title",
    });
  });
});
