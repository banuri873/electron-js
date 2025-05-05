const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
// we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('counterAPI', {
  saveValue: (value) => ipcRenderer.send('save-counter', value),
  loadValue: () => ipcRenderer.invoke('load-counter'),
  onMenuReset: (callback) => ipcRenderer.on('reset-counter', callback),
  onMenuIncrement: (callback) => ipcRenderer.on('increment-counter', callback),
  onMenuDecrement: (callback) => ipcRenderer.on('decrement-counter', callback)
})

contextBridge.exposeInMainWorld('contextMenuAPI', {
  showContextMenu: () => ipcRenderer.send('show-context-menu')
})

contextBridge.exposeInMainWorld('notificationAPI', {
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body })
})