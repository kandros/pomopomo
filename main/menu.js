// Packages
const { shell, clipboard } = require('electron')
const moment = require('moment')

const notify = require('./notify')

exports.innerMenu = async function(app, tray, data, windows) {
  let hasDeployments = false

  if (Array.isArray(data.deployments) && data.deployments.length > 0) {
    hasDeployments = true

    // Here we make sure we don't show any extra separators in the beginning/enabled
    // of the deployments list. macOS will just ignore them, but Windows will show them
    if (data.deployments[0].type === 'separator') {
      data.deployments.shift()
    }

    if (data.deployments[data.deployments.length - 1].type === 'separator') {
      data.deployments.pop()
    }
  }

  const config = await getConfig()
  let shareMenu

  if (process.platform === 'darwin') {
    shareMenu = {
      label: 'Share...',
      accelerator: 'CmdOrCtrl+S',
      async click() {
        await share(tray)
      }
    }
  } else {
    shareMenu = {
      label: 'Share...',
      accelerator: 'CmdOrCtrl+S',
      submenu: [
        {
          label: 'Directory...',
          async click() {
            await share(tray, ['openDirectory'])
          }
        },
        {
          label: 'File...',
          async click() {
            await share(tray, ['openFile'])
          }
        }
      ]
    }
  }

  return [
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click() {
        toggleWindow(null, windows.about)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Deploy...',
      accelerator: 'CmdOrCtrl+D',
      async click() {
        await deploy(tray)
      }
    },
    shareMenu,
    {
      type: 'separator'
    },
    {
      label: 'Deployments',

      // We need this because electron otherwise keeps the item alive
      // Even if the submenu is just an empty array
      type: hasDeployments ? 'submenu' : 'normal',

      submenu: hasDeployments ? data.deployments : [],
      visible: hasDeployments
    },
    (hasDeployments && { type: 'separator' }) || { visible: false },
    {
      label: 'Account',
      submenu: [
        {
          label: config.email || 'No user defined',
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Logout',
          async click() {
            await logout(app, windows.tutorial)
          }
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      click: app.quit,
      role: 'quit'
    }
  ]
}