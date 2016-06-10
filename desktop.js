const {
    app,
    BrowserWindow,
    ipcMain,
} = require('electron');

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
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL('file://' + __dirname + '/desktop.html');
    // mainWindow.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.on('focus', () => {
        sendState('active');
    });
    mainWindow.on('blur', () => {
        sendState('background');
    });
});
