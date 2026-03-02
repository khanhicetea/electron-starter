# AGENTS.md - Project Context for AI Agents

## Project Overview

**Name:** electron-stack
**Type:** Desktop application
**Description:** An Electron application with React and TypeScript, scaffolded with electron-vite.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Electron v39 |
| Build Tool | electron-vite v5 |
| Frontend | React v19 + TypeScript v5 |
| Bundler | Vite v7 |
| Package Manager | pnpm |
| Linting | ESLint v9 |
| Formatting | Prettier |
| Distribution | electron-builder |

## Project Structure

```
electron-stack/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.ts       # Main entry, window creation, IPC handlers
│   ├── preload/           # Preload scripts (bridge main <-> renderer)
│   │   ├── index.ts       # Context bridge setup
│   │   └── index.d.ts     # TypeScript declarations for exposed APIs
│   └── renderer/          # Frontend React app
│       ├── index.html     # HTML entry point
│       └── src/
│           ├── main.tsx   # React entry point
│           ├── App.tsx    # Root component
│           ├── env.d.ts   # Environment declarations
│           ├── components/
│           │   └── Versions.tsx  # Displays Electron/Chrome/Node versions
│           └── assets/
│               ├── base.css      # CSS variables, resets
│               └── main.css      # Main styles
├── build/                 # Build resources (icons, entitlements)
├── resources/             # App resources (icon.png)
├── out/                   # Compiled output (main, preload, renderer)
├── electron.vite.config.ts  # electron-vite configuration
├── electron-builder.yml   # electron-builder config for distribution
├── tsconfig.json          # Root TypeScript config (references)
├── tsconfig.node.json     # TS config for main/preload
└── tsconfig.web.json      # TS config for renderer
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

## Architecture

### Three-Process Model

1. **Main Process** (`src/main/index.ts`)
   - Runs in Node.js environment
   - Creates/manages BrowserWindow
   - Handles IPC from renderer
   - Access to all Node.js/Electron APIs

2. **Preload Scripts** (`src/preload/index.ts`)
   - Bridge between main and renderer
   - Uses `contextBridge` to expose safe APIs
   - Exposes `window.electron` (electronAPI) and `window.api` (custom APIs)

3. **Renderer Process** (`src/renderer/`)
   - React application
   - Runs in Chromium browser context
   - Accesses main process via exposed `window.electron` and `window.api`

### IPC Communication

```typescript
// Main process (src/main/index.ts)
ipcMain.on('ping', () => console.log('pong'))

// Renderer (via preload)
window.electron.ipcRenderer.send('ping')
```

## Path Aliases

| Alias | Path |
|-------|------|
| `@renderer/*` | `src/renderer/src/*` |

## UI

- Tailwind CSS v4
- Use shadcn/ui components in renderer
- Example command for adding a component : `pnpm dlx shadcn@latest add -p ./src/renderer/components/ui [component_name]`
- shadcn/ui components are pre-configured with tailwind CSS
- IMPORTANT : these shadcn/ui components use baseUI, not RadixUI (use `render={}` prop instead of `asChild`)
- Current theme named 'Lyra' which has sharp edges so don't use rounded corners unless I specifically want them
- The shadcn/ui components in ./src/renderer/components/ui are read-only, don't modify them directly, skip typechecks for them

## Security

- Content Security Policy enabled in `index.html`
- Context isolation enabled (sandbox: false for preload access)
- External links open in system browser

## Distribution

Configured in `electron-builder.yml`:
- **App ID:** `com.electron.app`
- **Platforms:** macOS (dmg), Windows (NSIS installer), Linux (AppImage, snap, deb)
- **Auto-update:** Configured for generic provider

## Development Notes

1. **Adding IPC handlers:** Add in `src/main/index.ts`, expose in `src/preload/index.ts`
2. **Adding components:** Create in `src/renderer/src/components/`
3. **Adding pages:** Currently single-page, add routing (e.g., react-router) if needed
4. **Environment detection:** Use `is.dev` from `@electron-toolkit/utils`
5. **Asset imports:** Use `?asset` suffix for assets in main process

## Common Patterns

### Expose API to Renderer

```typescript
// preload/index.ts
const api = {
  doSomething: () => ipcRenderer.invoke('do-something')
}
contextBridge.exposeInMainWorld('api', api)

// main/index.ts
ipcMain.handle('do-something', async () => {
  // handle request
  return result
})

// renderer (React)
const result = await window.api.doSomething()
```

### Type-safe Window APIs

Update `src/preload/index.d.ts` to add type declarations for custom APIs.
