const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
} = require('electron');
const path = require('path');

var mainWindow = null;

app.on('window-all-closed', () => {
    app.quit();
});

app.on('ready', () => {
    const sendState = (state) => {
        if (mainWindow) {
            mainWindow.webContents.send('state', state); 
        };
    };
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 640,
        title: 'Taskwarrior',
        icon: path.join(__dirname, 'desktop', 'res', 'icon.png')
    });
    mainWindow.loadURL('file://' + __dirname + '/desktop.html');
    // mainWindow.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    //mainWindow.on('focus', () => {
    //    sendState('active');
    //});
    mainWindow.on('blur', () => {
        sendState('background');
    });
    var template = [{
        label: 'Application',
        submenu: [{
            role: 'about',
        }, {
            type: 'separator'
        }, {
            role: 'quit',
        }]
    }, {
        label: 'Edit',
        submenu: [{
            role: 'undo',
        }, {
            role: 'redo',
        }, {
            type: 'separator',
        }, {
            role: 'cut',
        }, {
            role: 'copy',
        }, {
            role: 'paste',
        }, {
            role: 'selectall',
        }]
    }, {
        label: 'View',
        submenu: [{
            role: 'reload',
        }, {
            role: 'forcereload'
        }, {
            role: 'toggledevtools'
        }]
    }];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});
