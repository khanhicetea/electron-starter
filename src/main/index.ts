import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { RPCHandler } from '@orpc/server/message-port'
import { onError } from '@orpc/shared'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { closeDatabase, runMigrations } from '#/main/db'
import { router } from '#/shared/rpc'

// Create the RPC handler with the router
function createRPCHandler() {
  const handler = new RPCHandler(router, {
    interceptors: [
      onError((error) => {
        console.error('[ORPC Error]', error)
      })
    ]
  })
  return handler
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Run database migrations
  await runMigrations()

  // ORPC Server - Handle MessagePort from renderer via preload
  const handler = createRPCHandler()

  ipcMain.on('orpc:connect', async (event) => {
    const [serverPort] = event.ports
    if (serverPort) {
      console.log('[ORPC] Client connected via MessagePort')
      handler.upgrade(serverPort)
      serverPort.start()
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', async () => {
  await closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
