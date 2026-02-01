import { is } from '@electron-toolkit/utils'
import Database from 'better-sqlite3'
import { app } from 'electron'
import { Kysely, Migrator, SqliteDialect } from 'kysely'
import path from 'path'
import type { Database as DatabaseSchema } from '#/main/db/types'
import * as migration001 from '#/main/db/migrations/001_create_notes'

// Get database path based on environment
function getDatabasePath(): string {
  if (is.dev) {
    // Dev: store in project root
    return path.join(process.cwd(), 'dev.sqlite')
  } else {
    // Production: store in user data directory
    return path.join(app.getPath('userData'), 'app.sqlite')
  }
}

// Create Kysely instance
const dbPath = getDatabasePath()
console.log(`[DB] Using database at: ${dbPath}`)

const dialect = new SqliteDialect({
  database: new Database(dbPath)
})

export const db = new Kysely<DatabaseSchema>({
  dialect
})

// Migration provider with static imports
const migrationProvider = {
  async getMigrations() {
    return {
      '001_create_notes': migration001
    }
  }
}

// Run migrations
export async function runMigrations(): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: migrationProvider
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((result) => {
    if (result.status === 'Success') {
      console.log(`[DB] Migration "${result.migrationName}" was executed successfully`)
    } else if (result.status === 'Error') {
      console.error(`[DB] Migration "${result.migrationName}" failed`)
    }
  })

  if (error) {
    console.error('[DB] Migration failed:', error)
    throw error
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  await db.destroy()
}
