# Node.js application architecture without magic

In this workshop we'll be building parts of the backend for the [Real-World App project](https://github.com/gothinkster/realworld).

You can check the full app with UI and backend here: https://hyperapp.netlify.app/

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

### Big lesson: curried functions over classes

Most enterprise applications use classes as a main building block. A common pattern is to inject dependencies as constructor arguments
and to pass actual data as method arguments.
```ts
class MyClass {
    constructor(deps) {
    }
    action(data) {}
}
```
A much simpler approach is to replace classes with curring.
```ts
const action = (deps) => (data) => {}
```
Every action from your class becomes a separate action with curried dependencies.

## Understanding what a unit is in unit test

Unpacking the difference between **unit of code** and **unit of bahavior**.

![./images/unit.png](./images/unit.png)

Many people stick to London/mockist school of testing with mocks. Very often it leads to tests that make refactoring difficult as those tests
reflect the structure of the code under test.
We've just seen a Chicago school of testing (no mocks). Application actions are our unit of behavior under test. This unit of behavior consists of
the application service method talking to in-memory repositories. So a few units of code make up a unit of behavior.
Some people would argue that it's an integration test but since we're not touching any I/O and those tests are extremely fast
I'd call them unit tests.

## Deciding where to put the repository interface type

We'd like to have an explicit type for the `ArticleRepository`. Try to create it and decide where this type should live.

Hints:
* your IDE may have and option to extract existing types
* once you extract a repository type you can delete explicit typings in the in-memory implementation

## Making dates testable

A good heuristic of a testable codebase is only one occurance of `new Date()` in the entire codebase.
In the previous test we had to omit `createdAt` and `updatedAt` since they are not testable. Let's fix it.

Let's create **clock.ts**
```ts
export type Clock = () => Date;
export const now = () => new Date();
```
This is our production implementation of current date/time. We can swap this for unit testing purposes. 

Update our **createArticle.test.ts** and inject a fixed date/time clock so that we can skip the omit part.

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

Go and update `createArticle.ts` to use the ArticleInput from zod. 

Parsing libraries are much better than validation libraries because parsers give us **compile time type checking based on runtime schemas**.
In modern software development we don't have to write those DTOs by hand.

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

## Extracting remaining application service/use cases/workflows

Extract `updateArticle` workflow based on what we've learned previously.

## Starting a database

Time to persist our articles in a real database.

Here's a helpful Docker command to spin up postgres locally:
```dockerfile
docker run -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_USER=user -e POSTGRES_DB=conduit \
  --network conduit --name postgres postgres
```

Try to connect to the DB with a client app (e.g. pgAdmin).

## Setting up DB migrations

Create `migrate-to-latest.ts` file:

```typescript
import * as path from "path";
import { promises as fs } from "fs";
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from "kysely";
import { Pool } from "pg";

async function migrateToLatest() {
  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
```

## Creating our first migration

Here's the tables we want to create:
![./images/tables.png](./images/tables.png)

Create **src/migrations/0001_create_article.ts**

```typescript
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("article")
        .addColumn("id", "uuid", (col) => col.primaryKey())
        .addColumn("createdAt", "timestamp", (col) => col.notNull())
        .addColumn("updatedAt", "timestamp", (col) => col.notNull())
        .addColumn("slug", "text", (col) => col.notNull())
        .addColumn("title", "text", (col) => col.notNull())
        .addColumn("body", "text", (col) => col.notNull())
        .addColumn("description", "text", (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("tags")
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("articleId", "uuid", (col) =>
            col.references("article.id").notNull().onDelete("cascade")
        )
        .addPrimaryKeyConstraint("tags_primary_key", ["name", "articleId"])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("article").execute();
    await db.schema.dropTable("tags").execute();
}
```

Let's analyze what we're creating here.

Finally let's apply the migrations:
```
"migrate:latest": "DATABASE_URL=postgres://user:secret@localhost:5432/conduit ts-node src/migrate-to-latest.ts"
```

## Generating TS types from DB

In order to write type-safe queries we need to generate DB types.

```
"generate:types": "DATABASE_URL=postgres://user:secret@localhost:5432/conduit kysely-codegen --out-file=src/dbTypes.ts"
```

Let's analyze the file that was generated.

## Implementing SQL Article Repository

Create **sqlArticleRepository.ts** with the following starter code:
```typescript
import {ArticleRepository} from "./article";
import {Kysely} from "kysely";
import {DB} from "./dbTypes";

export const sqlArticleRepository = (db: Kysely<DB>): ArticleRepository => {

  return {
    async create(article) {
    },
    async update(article) {
    },
    async findBySlug(slug) {
    },
  };
};
```
From now let's live code the implementation together paying attention to auto-completion support in the IDE.

## Integration testing SQL repository

First we need to create a db instance.

**src/db.ts**
```typescript
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "./dbTypes";
import { Pool } from "pg";

export const createDb = (connectionString: string) =>
    new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString,
            }),
        })
    });
```

Copy-paste in-memory repository test and try to test our new SQL repository.

Some hints:
* for SQL variant, article id needs to be UUID e.g. "200db642-a014-46dc-b678-fc2777b4b301"
* clean DB before each test (```await db.deleteFrom("article").execute();```). Why is it better to clean before?

## Creating contract for repository

We had to create almost identical tests twice. Try to remove duplication between repositories and try to introduce a contract
for what it takes to be an article repository. This contract should serve us well if we decide to implement another variant e.g. MongoDB.

## Choosing SQL mode vs in-memory mode

It would be very convenient if our application started in SQL mode when the env var for DB is set and use in-memory mode otherwise.

In the **src/articlesRouter.ts**
```typescript
const articleRepository = process.env.DATABASE_URL ? sqlArticleRepository(createDb(
    process.env.DATABASE_URL
)) : inMemoryArticleRepository();
```

Let's test the setting by changing **package.json**
```
    "start": " DATABASE_URL=postgres://unleash_user:passord@localhost:5432/articles ts-node src/server.ts",
    "test": "DATABASE_URL=postgres://unleash_user:passord@localhost:5432/articles mocha --exit 'src/**/*.test.ts'",
```

There's a problem in the test command. In the SQL mode the id of article is expected to be uuid.

## Injecting real uuid provider

Create **src/uuidGenerator.ts**
```typescript
import { v4 as uuidv4 } from "uuid";
import { IdGenerator } from "./idGenerator";

export const uuidGenerator: IdGenerator = uuidv4;
```
Inject this provide in **src/articlesRouter.ts** depending on the DATABASE_URL config.

## Reading env vars from file

Currently we're updating the **package.json** scripts with env vars. But it's not very scalable approach.

Create **.env**
```
PORT=3000
DATABASE_URL=postgres://user:secret@localhost:5432/conduit
```

Modify your scripts:
```
    "start": "ts-node -r dotenv/config src/server.ts",
    "test": "mocha --exit 'src/**/*.test.ts'",
```

[-r preload option](https://nodejs.org/api/cli.html#-r---require-module) allows to run dotenv module before our app starts. It sets
all the env vars upfront. You can also inspect **.mocharc.js** to see how mocha allows to preload the env vars from a file.
For mocha I prefer to have a configuration file since I run my tests both from the CLI and from my IDE and both should respect the
configuration file.

## Modelling config

Currently `process.env` is spread across the entire codebase. We'd like to centralize config setting at the entry point to our application
since config will be used everywhere. As an extra benefit we'd like to parse the config at the startup time the same way we 
parse request body in our controllers/routers.

Create **src/config.ts**
```typescript
import { z } from "zod";

const Config = z.object({
    PORT: z.coerce.number(),
    DATABASE_URL: z.string().optional(),
});
export type Config = z.infer<typeof Config>;

export const config = Config.parse(process.env);
```

## Injecting config to the application and router

Read the config in the **src/server.ts** and pass it to other places that need it.

```typescript
import { createApp } from "./app";
import { config } from "./config";

const port = config.PORT;
const app = createApp(config);
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
```
Change your code so that you cna inject the config to your application and application can inject the config to the router.
Remember about changing our component test so that it respects the injection of config.

## Introducing use case composition root

**articleRouter.ts** has 2 responsibilities. It sets up the routes/controllers but also builds a graph of objects.
Let's split the graph of objects into a [composition root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/).

Here's the structure we want to have in **src/app.ts**
```typescript
const db = config.DATABASE_URL ? createDb(config.DATABASE_URL) : null;
const articleActions = db
    ? sqlArticlesCompositionRoot(db)
    : inMemoryArticlesCompositionRoot();
app.use(createArticlesRouter(articleActions));
```

And the actual router should accept all the actions and repository as dependencies:
```typescript
export const createArticlesRouter = ({
  create,
  update,
  articleRepository,
}: {
  create: CreateArticle;
  update: UpdateArticle;
  articleRepository: ArticleRepository;
}) => {
    // const article = await create(input);
    // const article = await update(slug, articleInput);
    // const existingArticle = await articleRepository.findBySlug(slug);
};
```

## Organizing code into directories: feature-driven architecture

I like to organize my code around business capabilities first and against technical responsibilities second.
So let's create **articles** directory and put everything related to article there.

Then let's put all the shared code into **shared** dir and all error handling related code in **error**.

## Organizing code into directories: technology-driven architecture

Once we're done with the feature-driven organization we can go inside article dir and organize code around technical
responsibilities:
* api
* application
* domain
* infrastructure

