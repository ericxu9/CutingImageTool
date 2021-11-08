// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path')

let mainWindow;

const template = [
  {
    label: '文件',
    accelerator: 'CmdOrCtrl+O',
    submenu: [
      {
        label: '打开', click() {
          dialog.showOpenDialog(mainWindow, {
            properties: ['openFile',],
            filters: [
              { name: 'Images', extensions: ['jpg', 'png'] }
            ]
          }).then(result => {
            //send selectd file path
            mainWindow.webContents.send('FILE_OPEN', result.filePaths);
          }).catch(err => {
            console.log(err)
          })
        }
      },
      {
        label: '退出', click() {
          app.quit();
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      //fix:Electron require() is not defined
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
