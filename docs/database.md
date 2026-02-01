# Database Documentation

This project uses **Kysely** with **better-sqlite3** for type-safe database operations.

## Setup

### Initial Installation

```bash
# Install dependencies
pnpm install

# Rebuild native modules for Electron (required for better-sqlite3)
pnpm rebuild
```

## Overview

- **ORM**: [Kysely](https://kysely.dev/) - Type-safe SQL query builder
- **Driver**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Fast, synchronous SQLite3 bindings

## Database Location

| Environment | Location |
|-------------|----------|
| Development | `./dev.sqlite` (project root) |
| Production  | `{userData}/app.sqlite` (OS-specific user data folder) |

### Production Paths by OS

- **macOS**: `~/Library/Application Support/{appName}/app.sqlite`
- **Windows**: `%APPDATA%/{appName}/app.sqlite`
- **Linux**: `~/.config/{appName}/app.sqlite`

## Migrations

Migrations are stored in `src/main/db/migrations/` and are auto-run on app startup in production.

### Migration Files

Each migration exports `up` and `down` functions:

```typescript
// src/main/db/migrations/001_create_notes.ts
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
```

### Adding New Migrations

1. Create a new file in `src/main/db/migrations/` with incrementing prefix (e.g., `002_create_users.ts`)
2. Import and register the migration in `src/main/db/index.ts`:

```typescript
import * as migration002 from './migrations/002_create_users'

const migrationProvider = {
  async getMigrations() {
    return {
      '001_create_notes': migration001,
      '002_create_users': migration002  // Add here
    }
  }
}
```

3. Also update `src/main/db/migrate.ts` with the same import

### NPM Scripts

```bash
# Run migrations on default database (app.sqlite in cwd)
pnpm db:migrate

# Run migrations on dev database
pnpm db:migrate:dev

# Run migrations on custom path
npx tsx src/main/db/migrate.ts /path/to/database.sqlite
```

## Schema Types

Database types are defined in `src/main/db/types.ts`:

```typescript
import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface NotesTable {
  id: Generated<number>
  title: string
  content: string
  created_at: Generated<string>
  updated_at: Generated<string>
}

export type Note = Selectable<NotesTable>
export type NewNote = Insertable<NotesTable>
export type NoteUpdate = Updateable<NotesTable>

export interface Database {
  notes: NotesTable
}
```

## Usage in RPC

The database is accessed in `src/shared/rpc/router.ts`:

```typescript
import { db } from '../main/db'

// Query example
const notes = await db
  .selectFrom('notes')
  .selectAll()
  .orderBy('created_at', 'desc')
  .execute()

// Insert example
const result = await db
  .insertInto('notes')
  .values({ title: 'Hello', content: 'World' })
  .returning(['id', 'title', 'content', 'created_at', 'updated_at'])
  .executeTakeFirstOrThrow()

// Update example
await db
  .updateTable('notes')
  .set({ title: 'Updated' })
  .where('id', '=', 1)
  .execute()

// Delete example
await db
  .deleteFrom('notes')
  .where('id', '=', 1)
  .execute()
```

## File Structure

```
src/main/db/
├── index.ts           # Database instance, migrations runner
├── types.ts           # TypeScript type definitions
├── migrate.ts         # CLI migration script
└── migrations/
    └── 001_create_notes.ts
```

## Auto-Migration Behavior

- **Development**: Migrations run on app start, database at `./dev.sqlite`
- **Production**: Migrations run on app start, database at user data folder
- Migrations are idempotent - already applied migrations are skipped
