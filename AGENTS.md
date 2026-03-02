# AGENTS.md - Project Context for AI Agents

## Project Overview

**Name:** electron-stack
**Type:** Desktop application
**Description:** An Electron application with React, TypeScript, TanStack Router, and SQLite database.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Electron v39 |
| Build Tool | electron-vite v5 |
| Frontend | React v19 + TypeScript v5 |
| Router | TanStack Router v1 |
| Data Fetching | TanStack Query v5 |
| IPC | oRPC (type-safe via MessagePort) |
| Database | SQLite (better-sqlite3) + Kysely |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Bundler | Vite v7 |
| Package Manager | pnpm |
| Linting | ESLint v9 |
| Formatting | Prettier |

## Project Structure

```
electron-stack/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # Main entry, window creation, oRPC handler
│   │   └── db/                  # Database layer
│   │       ├── index.ts         # Kysely instance & migration runner
│   │       ├── types.ts         # Database type definitions
│   │       ├── migrate.ts       # CLI migration script
│   │       └── migrations/      # Migration files
│   │           └── 001_create_notes.ts
│   ├── preload/                 # Preload scripts
│   │   ├── index.ts             # Context bridge, oRPC MessagePort forwarding
│   │   └── index.d.ts           # TypeScript declarations
│   ├── renderer/                # Frontend React app
│   │   ├── index.html           # HTML entry point
│   │   ├── main.tsx             # React entry, router setup
│   │   ├── styles.css           # Tailwind CSS
│   │   ├── routes/              # TanStack Router file-based routes
│   │   │   ├── __root.tsx       # Root layout with sidebar
│   │   │   ├── index.tsx        # Dashboard page
│   │   │   ├── notes.tsx        # Notes CRUD page
│   │   │   ├── database.tsx     # Database info page
│   │   │   ├── settings.tsx     # Settings page
│   │   │   └── routeTree.gen.ts # Generated route tree
│   │   ├── components/          # React components
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── hooks/               # React hooks
│   │   ├── lib/                 # Utilities
│   │   │   ├── orpc.ts          # oRPC client setup
│   │   │   ├── QueryProvider.tsx
│   │   │   └── utils.ts
│   │   └── assets/              # Static assets
│   └── shared/                  # Shared between main/renderer
│       └── rpc/                 # oRPC router definitions
│           ├── index.ts         # Re-exports
│           ├── router.ts        # Main router
│           ├── demo.ts          # Demo procedures
│           └── notes.ts         # Notes CRUD procedures
├── build/                       # Build resources (icons, entitlements)
├── resources/                   # App resources (icon.png)
├── docs/                        # Documentation
├── electron.vite.config.ts      # electron-vite configuration
├── electron-builder.yml         # Distribution config
├── components.json              # shadcn/ui configuration
└── tsconfig.*.json              # TypeScript configs
```

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development with hot reload |
| `pnpm build` | Type-check and build for production |
| `pnpm build:mac` | Build macOS distributable |
| `pnpm build:win` | Build Windows distributable |
| `pnpm build:linux` | Build Linux distributable |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:migrate:dev` | Run migrations on dev.sqlite |
| `pnpm rebuild` | Rebuild native modules (better-sqlite3) |

## Architecture

### Three-Process Model

1. **Main Process** (`src/main/`)
   - Runs in Node.js environment
   - Creates/manages BrowserWindow
   - Handles oRPC requests via MessagePort
   - Database access (SQLite + Kysely)
   - Full access to Node.js/Electron APIs

2. **Preload Scripts** (`src/preload/`)
   - Bridge between main and renderer
   - Forwards MessagePort for oRPC communication
   - Exposes `window.electron` (electron-toolkit API)

3. **Renderer Process** (`src/renderer/`)
   - React application with TanStack Router
   - TanStack Query for data fetching/caching
   - oRPC client for type-safe IPC calls
   - shadcn/ui components with Tailwind CSS

### oRPC Communication

Type-safe IPC via MessagePort:

```typescript
// 1. Define procedure (src/shared/rpc/notes.ts)
const base = os.$context<{}>()
export const notesRouter = {
  getAll: base.handler(async () => {
    return await db.selectFrom('notes').selectAll().execute()
  })
}

// 2. Main process handles requests (src/main/index.ts)
const handler = new RPCHandler(router)
ipcMain.on('orpc:connect', (event) => {
  const [serverPort] = event.ports
  handler.upgrade(serverPort)
})

// 3. Renderer calls via client (src/renderer/lib/orpc.ts)
export const orpc = createTanstackQueryUtils(orpcClient)

// 4. Use in React component
const { data } = useQuery(orpc.notes.getAll.queryOptions({}))
```

### Database Layer

- **Kysely** for type-safe SQL queries
- **better-sqlite3** as SQLite driver
- Auto-migration on app startup
- Dev: `./dev.sqlite` | Prod: `{userData}/app.sqlite`

```typescript
// Define types (src/main/db/types.ts)
export interface Database {
  notes: NotesTable
}

// Query with Kysely
const notes = await db.selectFrom('notes').selectAll().execute()

// Create migration (src/main/db/migrations/xxx.ts)
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('notes')...
}
```

### Routing

File-based routing with TanStack Router:

```
src/renderer/routes/
├── __root.tsx     # Root layout (sidebar, header)
├── index.tsx      # / (Dashboard)
├── notes.tsx      # /notes
├── database.tsx   # /database
└── settings.tsx   # /settings
```

```typescript
// Navigation with Link
import { Link } from '@tanstack/react-router'
<Link to="/notes">Notes</Link>

// Route definition
export const Route = createFileRoute('/notes')({
  component: NotesComponent,
})
```

## Path Aliases

| Alias | Path | Used In |
|-------|------|---------|
| `@/*` | `src/renderer/*` | Renderer only |
| `#/main/*` | `src/main/*` | Main, preload, shared |
| `#/preload/*` | `src/preload/*` | Main, preload, shared |
| `#/shared/*` | `src/shared/*` | All processes |

## UI Components

- Tailwind CSS v4
- shadcn/ui components in `src/renderer/components/ui/`
- Theme: **Lyra** (sharp edges, avoid rounded corners unless specified)
- Icons: **Lucide React**
- Add components: `pnpm dlx shadcn@latest add -p ./src/renderer/components/ui [component]`
- **Important**: shadcn/ui components use **Base UI** (use `render={}` prop, not `asChild`)
- shadcn/ui components are read-only - don't modify them directly

## Adding New Features

### Add a New Database Table

1. Create migration: `src/main/db/migrations/002_xxx.ts`
2. Update types: `src/main/db/types.ts`
3. Register migration in `src/main/db/index.ts`
4. Add RPC procedures: `src/shared/rpc/xxx.ts`
5. Export from `src/shared/rpc/router.ts`

### Add a New Page

1. Create route file: `src/renderer/routes/newpage.tsx`
2. Add navigation item in `src/renderer/components/ui/app-sidebar.tsx`

### Add an RPC Procedure

```typescript
// src/shared/rpc/router.ts
import { newRouter } from './new'

export const router = {
  demo: demoRouter,
  notes: notesRouter,
  new: newRouter,  // Add here
}

// src/shared/rpc/new.ts
const base = os.$context<{}>()
export const newRouter = {
  doSomething: base.handler(async () => { ... })
}

// Use in renderer
const { data } = useQuery(orpc.new.doSomething.queryOptions({}))
```

## Security

- Context isolation enabled
- sandbox: false (required for preload access)
- External links open in system browser
- No direct IPC exposure - all via oRPC

## Distribution

Configured in `electron-builder.yml`:
- **App ID:** `com.electron.app`
- **Platforms:** macOS (dmg), Windows (NSIS), Linux (AppImage, snap, deb)
- **Auto-update:** Configured for generic provider

## Development Notes

1. **Hot reload:** Renderer reloads on file changes, main process restarts
2. **Type safety:** oRPC provides end-to-end type safety from main to renderer
3. **Database:** Migrations run automatically on app start
4. **Native modules:** Run `pnpm rebuild` after changing Electron version
5. **Asset imports:** Use `?asset` suffix for assets in main process