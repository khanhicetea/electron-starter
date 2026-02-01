# Kysely + SQLite Implementation Summary

## What Was Added

### 1. Database Setup (`src/main/db/`)

- **types.ts** - TypeScript type definitions for database tables
  - `NotesTable` interface with id, title, content, timestamps
  - `Note`, `NewNote`, `NoteUpdate` types for different operations
  - `Database` interface combining all tables

- **index.ts** - Database connection and migration runner
  - Development database: `./dev.sqlite`
  - Production database: `{userData}/app.sqlite` (OS-specific)
  - Auto-migration on app startup
  - Database connection cleanup on app quit

- **migrations/001_create_notes.ts** - Initial migration
  - Creates `notes` table with id, title, content, timestamps
  - Includes `up()` and `down()` functions

- **migrate.ts** - CLI migration script
  - Can be run independently with `pnpm db:migrate` or `pnpm db:migrate:dev`
  - Supports custom database path as argument

### 2. RPC Procedures (`src/shared/rpc/router.ts`)

Added `notes` procedures:

- **getAll** - Fetch all notes (query)
- **getById** - Fetch a single note by id (query)
- **create** - Create a new note (mutation)
- **update** - Update an existing note (mutation)
- **delete** - Delete a note (mutation)

### 3. Main Process Updates (`src/main/index.ts`)

- Import and run migrations on app startup
- Clean up database connection on app quit

### 4. Renderer UI (`src/renderer/src/App.tsx`)

Added Notes section with:

- Create note form (title + content inputs)
- List of all notes with delete button
- Uses React Query for caching and optimistic updates

### 5. Styling (`src/renderer/src/assets/main.css`)

Added CSS for:
- Notes section layout
- Form column styling
- Note item cards
- Delete buttons
- Empty state

### 6. Documentation

- **docs/database.md** - Comprehensive database documentation
- **README.md** - Updated with database info and project structure

### 7. Dependencies

Added to `package.json`:
- `kysely` - Type-safe query builder
- `better-sqlite3` - SQLite driver
- `@types/better-sqlite3` - TypeScript types
- `@electron/rebuild` - Rebuild native modules for Electron
- `tsx` - TypeScript execution

Added to `onlyBuiltDependencies`:
- `better-sqlite3` - Required for native module build

### 8. NPM Scripts

```bash
pnpm db:migrate       # Run migrations on default database
pnpm db:migrate:dev   # Run migrations on dev database
pnpm rebuild          # Rebuild native modules for Electron
```

## File Structure

```
src/main/db/
├── index.ts           # Database instance & migration runner
├── types.ts           # TypeScript types
├── migrate.ts         # CLI migration script
└── migrations/
    └── 001_create_notes.ts

src/shared/rpc/
└── router.ts          # RPC procedures (demo + notes)

src/renderer/src/
├── App.tsx            # UI with notes section
└── assets/
    └── main.css       # Styles including notes

docs/
└── database.md        # Database documentation
```

## Usage

### Creating a Note

```typescript
import { orpc } from './lib/orpc'

const { mutate: createNote } = useMutation(orpc.notes.create.mutationOptions())

createNote({ title: 'Hello', content: 'World' })
```

### Fetching Notes

```typescript
const { data: notes } = useQuery(orpc.notes.getAll.queryOptions())
```

### Adding a New Table

1. Create migration in `src/main/db/migrations/002_xxx.ts`
2. Update types in `src/main/db/types.ts`
3. Add RPC procedures in `src/shared/rpc/router.ts`
4. Register migration in `src/main/db/index.ts` and `src/main/db/migrate.ts`
