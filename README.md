# Node.js application architecture without magic


## Using minimal scripts and dependencies

Go to package.json and check the available scripts. 
Run `npm i --omit=dev` to install all production dependencies we gonna use in this course.

Check the **size of all production deps** with `du -sh node_modules`. As you can see we should cap around 11MB. This is because
we're not gonna use big frameworks in this course. Every line of code is a liability and we'll be very picky about **choosing
only the things that we need**. We don't want to solve framework author's problem but our own. And our strategy will be to
pick small libraries doing one thing well and playing well with others.

Now run full install `npm i` to get also our dev dependencies.

## Getting to know the application through the existing tests

Go to https://martinfowler.com/articles/microservice-testing/#conclusion-summary to check all test types that we
have in a typical backend application. How would you categorize our **src/app.test.ts**?

What do you think about test and production code sitting next to each other? Have you heard of the **common-closure principle**?

## Understanding pipes and filters architecture

Now that you've seen the application behavior described as tests go to the production code and check what it's doing.

To understand lightweight frameworks like *express* is let's unpack the **pipes and filters architecture**

![images/pipes_and_filters.png](images/pipes_and_filters.png)

The interesting part in express is how error handlers are added to the end of the pipeline. Not-found handler usually goes as second last.
And the generic catch-all handler goes at the very end. Any next() invocations or errors thrown in previous handlers end up in the 
catch-all handler.

## Extracting routing from the application

Create a new file **src/articlesRouter.ts** and move all the articles related code to the file.
Here's some tips how to get started.

```ts
import {Router} from "express";

export const articlesRouter = Router();

articlesRouter.post("/api/articles", async (req, res, next) => {
});
```

In **src/app.ts** you can include the router like this:
```ts
import {articlesRouter} from "./articlesRouter";

app.use(articlesRouter);
```

## Extracting error handlers from the application

Now it's your turn. Move all the error handling code to **src/errorHandler.ts*.

## Separating domain type and introducing tiny types

Move the type for Article into **src/article.ts**. As a bonus we can add **tiny-types** to improve type-level domain vocabulary.

```ts
export type Tag = string;
export type ArticleId = string;
export type Slug = string;
```

## Test-driving in-memory article repository

Saving articles to a collection was fine for now, but we'd like to introduce an abstraction for data persistence. Eventually
we'll store data in a real database so a good abstraction will come in handy. 

Here's a few hints:
* article repository should start with clean state in each test
* all operations should be async so that it's compatibile with real DB repository

**src/inMemoryArticleRepository.test.ts**
```ts
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
```

## Replacing variable with repository

Switch `articles` variable with the `articleRepository`.

## Introducing application service methods

Our router should not be concerned with making slugs or generating ids. Instead of a typical application service object
we can introduce a method for handling article creation use case.

```ts
articlesRouter.post("/api/articles", async (req, res, next) => {
    const input = req.body.article;

    const article = await createArticle(articleRepository, articleIdGenerator)(input);

    res.json({ article: omit(article, "id") });
});
```

To make it easier to implement `createArticle` use case I prepared this test to drive your production code:

**src/createArticle.test.ts**
```ts
import {createArticle} from "./createArticle";
import assert from "assert";
import {inMemoryArticleRepository} from "./inMemoryArticleRepository";
import omit from "lodash.omit";

describe("Create article", function () {
    it("happy path", async function () {
        const articleRepository = inMemoryArticleRepository();
        const idGenerator = () => "articleId";
        const create = createArticle(articleRepository, idGenerator);

        const article = await create(
            {
                title: "The title",
                body: "body",
                description: "",
                tagList: ["tag1", "tag2"],
            }
        );

        const fetchedArticle = await articleRepository.findBySlug(article.slug);

        assert.deepStrictEqual(omit(fetchedArticle, 'createdAt', 'updatedAt'), {
            body: "body",
            description: "",
            id: "articleId",
            slug: "the-title",
            tagList: ["tag1", "tag2"],
            title: "The title",
        });
    });

});
```
Here's some TS typing hints:
* To get article repository type for now you can use: `ReturnType<typeof inMemoryArticleRepository>`
* Introduce `IdGenerator` type
* Introduce `ArticleInput` type. It should not be the same as the `Article` type.

## Understanding what a unit is in unit test

Unpacking the difference between **unit of code** and **unit of bahavior**.

![./images/unit.png](./images/unit.png

## Deciding where to put the repository interface type

We'd like to have an explicit type for the `ArticleRepository`. Try to create it and decide where this type should live.

Hints:
* your IDE may have and option to extract existing types
* once you extract a repository type you can delete explicit typings in the in-memory implementation

## Parsing input data

`createArticle` accepts ArticleInput type. Check what type we get at the method call site?

Create **parseArticleInput.ts**
```ts
import { z } from "zod";

export const ArticleInput = z.object({
  title: z.string().min(1),
  body: z.string(),
  description: z.string(),
  tagList: z.array(z.string()),
});
export type ArticleInput = z.infer<typeof ArticleInput>;
```

Here's how to use it:
```ts
import {ArticleInput} from "./parseArticleInput";

const input = ArticleInput.parse(req.body.article);
```
What are the types now? 

Parsing libraries are much better than validation libraries because parsers give us **compile time type checking based on runtime schemas**.

## Handling parsing errors

Try adding this test case to **src/app.test.ts**
```ts
    const failedArticle = await createArticle(
    request,
    // @ts-ignore
    {
        title: "",
    },
    422
);

assert.deepStrictEqual(failedArticle.body.errors.length, 4);
```
Our contract for invalid input data will be 422 HTTP status code and input parsing errors from zod.

Try to think how we can handle this error. Where would you put the error handling logic?
