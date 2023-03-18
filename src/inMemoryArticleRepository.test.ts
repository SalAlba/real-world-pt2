import {Article} from "./article";
import {inMemoryArticleRepository} from "./inMemoryArticleRepository";
import assert from "assert";

describe('In memory article repository', function () {
  it('should create articles', async function () {
    const article: Article = {
      id: "id",
      slug: "the-title",
      title: "The title",
      body: "body",
      tagList: ["tag1", "tag2"],
      description: "description",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const repository = inMemoryArticleRepository();

    await repository.create(article);

    const result = await repository.findBySlug("the-title");

    assert.deepStrictEqual(result, article);
  });

  it('should update articles', async function () {
    const article: Article = {
      id: "id",
      slug: "the-title",
      title: "The title",
      body: "body",
      tagList: ["tag1", "tag2"],
      description: "description",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const repository = inMemoryArticleRepository();

    await repository.create(article);
    await repository.update({...article, body: 'updated body'});

    const result = await repository.findBySlug("the-title");

    assert.deepStrictEqual(result!.body, 'updated body');
  });

  it('should return null when article not found', async function () {
    const repository = inMemoryArticleRepository();

    const result = await repository.findBySlug("the-title");

    assert.deepStrictEqual(result, null);
  });

});