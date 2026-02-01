import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// ORPC: Forward MessagePort from renderer to main process
window.addEventListener('message', (event) => {
  if (event.data === 'orpc:connect') {
    const [serverPort] = event.ports
    if (serverPort) {
      ipcRenderer.postMessage('orpc:connect', null, [serverPort])
    }
  }
})

// Use `contextBridge` APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
