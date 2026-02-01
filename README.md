# electron-stack

An Electron application with React and TypeScript

## Features

- ⚛️ React 19 with TypeScript
- 🔄 Type-safe RPC using [ORPC](https://orpc.unnoq.com/)
- 🗄️ SQLite database with [Kysely](https://kysely.dev/) (type-safe queries)
- 📦 React Query for server state management
- 🔨 Electron + Vite for fast builds

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install

# Rebuild native modules for Electron (required for better-sqlite3)
$ pnpm rebuild
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Database

This project uses **SQLite** with **Kysely** for type-safe database operations.

### Database Location

- **Development**: `./dev.sqlite` (project root)
- **Production**: `{userData}/app.sqlite` (OS-specific user data folder)

### Database Commands

```bash
# Run migrations on default database
$ pnpm db:migrate

# Run migrations on dev database
$ pnpm db:migrate:dev
```

### Migration Documentation

For detailed information on migrations, adding tables, and querying the database, see [docs/database.md](./docs/database.md).

## Project Structure

```
electron-stack/
├── src/
│   ├── main/           # Electron main process
│   │   ├── db/         # Database setup, types, migrations
│   │   └── index.ts    # Main entry point
│   ├── preload/        # Preload scripts
│   ├── renderer/       # React renderer process
│   │   └── src/
│   │       ├── App.tsx # Main UI component
│   │       └── lib/    # ORPC client setup
│   └── shared/         # Shared code between processes
│       └── rpc/        # RPC router definition
├── docs/               # Documentation
└── ...
```

