import { createArticle } from "./createArticle";
import assert from "assert";
import { inMemoryArticleRepository } from "./inMemoryArticleRepository";
import omit from "lodash.omit";

describe("Create article", function () {
  it("happy path", async function () {
    const articleRepository = inMemoryArticleRepository();
    const idGenerator = () => "articleId";
    const create = createArticle(articleRepository, idGenerator);

    const article = await create({
      title: "The title",
      body: "body",
      description: "",
      tagList: ["tag1", "tag2"],
    });

    const fetchedArticle = await articleRepository.findBySlug(article.slug);

    assert.deepStrictEqual(omit(fetchedArticle, "createdAt", "updatedAt"), {
      body: "body",
      description: "",
      id: "articleId",
      slug: "the-title",
      tagList: ["tag1", "tag2"],
      title: "The title",
    });
  });
});
