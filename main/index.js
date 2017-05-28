const path = require('path')
const { app, Tray, Menu, BrowserWindow, ipcMain} = require('electron')
const ms = require('ms')
const fixPath = require('fix-path')
const { resolve: resolvePath } = require('app-root-path')
const firstRun = require('first-run')
const {outerMenu} = require('./menu')
const notify = require('./notify')
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

function windowURL(page) {
  return (isDev ? `http://localhost:8000` : `next://app`) + `/${page}`
}

const pomodoroWindow = () => {
  const win = new BrowserWindow({
    width: 650,
    height: 40,
    title: 'PomoPomo',
    resizable: true,
    center: true,
    frame: false,
    show: true,
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: '',
    transparent: true,
    toolbar: false,
    alwaysOnTop: true
  })

  win.loadURL(windowURL('pomodoro'))

  return win
}

app.on('ready', async () => {
  try {
    tray = new Tray(resolvePath(`./main/static/tray/pomodoro.png`))

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

  ipcMain.on('notify', (event, notification) => {
    notify(notification)
  })

  ipcMain.on('update-timer', (event, timeLeft)=> {
      tray.setTitle(timeLeft);
  })
})
