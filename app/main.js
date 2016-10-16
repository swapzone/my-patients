const {app, BrowserWindow, Menu} = require('electron');

// set production flag to true before release
const production = false;

let mainWindow = null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 960,
    height: 800
  });

  // Create menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  if(!production) {
    var client = require('electron-connect').client;

    // Connect to server process
    client.create(mainWindow);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

const menuTemplate = [
  {
    label: 'Programm',
    submenu: [
      {
        label: 'Vollbild',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Neu laden',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Beenden',
        accelerator: 'Ctrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: 'Hilfe',
    role: 'help',
    submenu: [
      {
        label: 'Mehr erfahren',
        click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
      }
    ]
  }
];

if (process.platform == 'darwin') {
  const name = require('electron').app.getName();
  menuTemplate.unshift({
    label: name,
    submenu: [
      {
        label: 'Über  ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Beenden',
        accelerator: 'Command+Q',
        click: function() {
          app.quit();
        }
      }
    ]
  });
}