
const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage ,globalShortcut,Notification} = require('electron')

require('update-electron-app')({
  repo: 'banuri873/electron-js'
})


const path = require('path')
const fs = require('fs')

let tray = null

// Path for saving counter value
const userDataPath = app.getPath('userData')
const counterFilePath = path.join(userDataPath, 'counter-value.json')


function showNotification(title, body) {
  new Notification({
    title: title,
    body: body
  }).show()
}

function createMenu(mainWindow) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reset Counter',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('reset-counter')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Increment',
          accelerator: 'CmdOrCtrl+Up',
          click: () => {
            mainWindow.webContents.send('increment-counter')
          }
        },
        {
          label: 'Decrement',
          accelerator: 'CmdOrCtrl+Down',
          click: () => {
            mainWindow.webContents.send('decrement-counter')
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createContextMenu(mainWindow) {
  ipcMain.on('show-context-menu', (event) => {
    const template = [
      {
        label: 'Increment',
        click: () => {
          mainWindow.webContents.send('increment-counter')
        }
      },
      {
        label: 'Decrement',
        click: () => {
          mainWindow.webContents.send('decrement-counter')
        }
      },
      { type: 'separator' },
      {
        label: 'Reset',
        click: () => {
          mainWindow.webContents.send('reset-counter')
        }
      }
    ]
    
    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: mainWindow })
  })
}


function registerGlobalShortcuts(mainWindow) {
  // Register global shortcuts
  globalShortcut.register('Alt+Up', () => {
    mainWindow.webContents.send('increment-counter')
    // Show the window if it's hidden
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
  })
  
  globalShortcut.register('Alt+Down', () => {
    mainWindow.webContents.send('decrement-counter')
    // Show the window if it's hidden
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
  })
}



function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  
  // Hide window instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
      return false
    }
  })
  
  return mainWindow
}

function createTray(mainWindow) {
  // Create a tray icon
  const iconPath = path.join(__dirname, 'icon.png') // You'll need to add an icon file
  const trayIcon = nativeImage.createFromPath(iconPath)
  
  tray = new Tray(trayIcon)
  tray.setToolTip('Counter App')
  
  // Create context menu for tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Counter',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: 'Increment',
      click: () => {
        mainWindow.webContents.send('increment-counter')
      }
    },
    {
      label: 'Decrement',
      click: () => {
        mainWindow.webContents.send('decrement-counter')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
  
  // Show window when tray icon is clicked
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

app.whenReady().then(() => {
  // Create the window and store the reference
  const mainWindow = createWindow()
  
  // Create the menu and pass the mainWindow reference
  createMenu(mainWindow)

  createContextMenu(mainWindow)

  createTray(mainWindow)
  registerGlobalShortcuts(mainWindow)
// Handle save counter message
  ipcMain.on('save-counter', (event, value) => {
    const data = { counterValue: value }
    fs.writeFileSync(counterFilePath, JSON.stringify(data))
  })

// Handle load counter request
  ipcMain.handle('load-counter', () => {
    if (fs.existsSync(counterFilePath)) {
      const data = fs.readFileSync(counterFilePath, 'utf8')
      return JSON.parse(data).counterValue
    }
    return 0// Default value if file doesn't exist or can't be read
  })
  ipcMain.on('show-notification', (event, { title, body }) => {
    showNotification(title, body)
  })

 
})

// app.on('window-all-closed', () => {
//   app.quit()
// })
app.on('window-all-closed', () => {
  // Don't quit when all windows are closed
  // This allows the app to stay running in the tray
})

app.on('before-quit', () => {
  app.isQuitting = true
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  // Clean up tray icon
  if (tray) {
    tray.destroy()
  }
})