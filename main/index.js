if (require('electron-squirrel-startup')) {
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit()
}

const path = require('path')
const {pomodoroBarHeight} = require('../renderer/constants')
const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron')
const ms = require('ms')
const isDev = require('electron-is-dev')
const { dir: isDirectory } = require('path-type')
const fs = require('fs-promise')
const fixPath = require('fix-path')
const { resolve: resolvePath } = require('app-root-path')
const firstRun = require('first-run')
const {outerMenu} = require('./menu')
const server = require('./server')

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null

// Set the application's name
app.setName('PomoPomo')

// Hide dock icon before the app starts
// This is only required for development because
// we're setting a property on the bundled app
// in production, which prevents the icon from flickering
if (isDev && process.platform === 'darwin') {
  // App.dock.hide()
}

// Make Now start automatically on login
if (!isDev && firstRun()) {
  app.setLoginItemSettings({
    openAtLogin: true
  })
}

// Makes sure where inheriting the correct path
// Within the bundled app, the path would otherwise be different
fixPath()

// Make sure that unhandled errors get handled
process.on('uncaughtException', err => {
  console.error(err)
  showError('Unhandled error appeared', err)
})

const windowURL = page => {
  return (isDev ? `http://localhost:8000` : `next://app`) + `/${page}`
}

const pomodoroWindow = () => {
  const win = new BrowserWindow({
    width: 650,
    height: pomodoroBarHeight,
    title: 'PomoPomo',
    resizable: true,
    center: true,
    frame: false,
    show: true,
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: '',
    transparent: true,
    toolbar: false
  })

  win.loadURL(windowURL('pomodoro'))

  return win
}

app.on('ready', async () => {
  try {
    const iconName = process.platform === 'win32' ? 'iconWhite' : 'iconTemplate'
    tray = new Tray(resolvePath(`./main/static/tray/${iconName}.png`))

    // Opening the context menu after login should work
    global.tray = tray
  } catch (err) {
    showError('Could not spawn tray item', err)
    return
  }

  try {
    await server()
  } catch (err) {
    showError('Not able to start server', err)
    return
  }

  const windows = {
    pomodoro: pomodoroWindow(),
  }
  
  let submenuShown = false

  tray.on('right-click', async event => {
    const menu = Menu.buildFromTemplate(outerMenu(app, windows))

    // Toggle submenu
    tray.popUpContextMenu(submenuShown ? null : menu)
    submenuShown = !submenuShown

    event.preventDefault()
  })
})
