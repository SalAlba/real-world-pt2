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
