import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('notes')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('notes').execute()
}
