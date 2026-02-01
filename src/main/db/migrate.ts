import Database from 'better-sqlite3'
import { Kysely, Migrator, SqliteDialect } from 'kysely'
import path from 'path'
import * as migration001 from './migrations/001_create_notes'

// Get database path from argument or default to production path
const dbPath = process.argv[2] || path.join(process.cwd(), 'app.sqlite')

console.log(`[Migrate] Running migrations on: ${dbPath}`)

const dialect = new SqliteDialect({
  database: new Database(dbPath)
})

const db = new Kysely({
  dialect
})

const migrationProvider = {
  async getMigrations() {
    return {
      '001_create_notes': migration001
    }
  }
}

async function migrate() {
  const migrator = new Migrator({
    db,
    provider: migrationProvider
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((result) => {
    if (result.status === 'Success') {
      console.log(`[Migrate] ✓ "${result.migrationName}" executed successfully`)
    } else if (result.status === 'Error') {
      console.error(`[Migrate] ✗ "${result.migrationName}" failed`)
    } else if (result.status === 'NotExecuted') {
      console.log(`[Migrate] - "${result.migrationName}" was not executed`)
    }
  })

  if (error) {
    console.error('[Migrate] Migration failed:', error)
    process.exit(1)
  }

  if (!results?.length) {
    console.log('[Migrate] No pending migrations')
  }

  await db.destroy()
  console.log('[Migrate] Done')
}

migrate()
