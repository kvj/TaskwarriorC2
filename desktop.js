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
            label: 'About TaskwC2',
            selector: 'orderFrontStandardAboutPanel:'
        }, {
            type: 'separator'
        }, {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() { app.quit(); }
        }]
    }, {
        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            selector: 'undo:'
        }, {
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
            selector: 'redo:'
        }, {
            type: 'separator'
        }, {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
        }, {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
        }, {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
        }, {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            selector: 'selectAll:'
        }]
    }];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});
