import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("favorite_count")
    .addColumn("articleId", "uuid", (col) =>
      col.references("article.id").primaryKey().onDelete("cascade")
    )
    .addColumn("count", "integer", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("favorite_count").execute();
}
