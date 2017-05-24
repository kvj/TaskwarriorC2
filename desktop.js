const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
} = require('electron');
const path = require('path');

let mainWindow = null;

const watchForPosition = (win, prefix, config) => {
    const {screen} = require('electron');
    let x = config.x || 100;
    let y = config.y || 100;
    let id = config.screen || 0;
    let pos = config.corner || 2;
    const moveWin = () => {
        let scr = screen.getPrimaryDisplay();
        screen.getAllDisplays().forEach((s, idx) => {
            // console.log('Screen:', idx, s.id);
            if (s.id === id) { // Found
                scr = s;
            };
        });
        const [w, h] = win.getSize();
        let xx = scr.bounds.x + x;
        let yy = scr.bounds.y + y;
        if (pos == 2 || pos == 4) { // right-top
            xx = scr.bounds.x + scr.size.width - x - w;
        };
        if (pos == 3 || pos == 4) { // left-bottom
            yy = scr.bounds.y + scr.size.height - y - h;
        };
        win.setPosition(xx, yy);
    };
    const savePosition = () => {
        // Calculate x, y, corner
        const [ww, hh] = win.getSize();
        let [xx, yy] = win.getPosition();
        const scr = screen.getDisplayNearestPoint({x: xx, y: yy});
        xx -= scr.bounds.x;
        yy -= scr.bounds.y;
        const w = scr.size.width;
        const h = scr.size.height;
        let corner = 1;
        if (xx > w / 2) { // Right side
            corner = 2;
            if (yy > h / 2) { // Bottom side
                corner = 4;
            };
        } else { // Left side
            if (yy > h / 2) { // Bottom side
                corner = 3;
            };
        };
        switch(corner) {
            case 2: // Left
                xx = w - xx - ww;
                break;
            case 3:
                yy = h - yy - hh;
                break;
            case 4:
                yy = h - yy - hh;
                xx = w - xx - ww;
                break;
        }
        // console.log('Position:', x, y, pos, xx, yy, corner);
        pos = corner;
        x = xx;
        y = yy;
    };
    win.on('move', (evt) => {
        // console.log('Win moved:', win.getPosition());
        savePosition();
    });
    screen.on('display-added', () => {
        moveWin();
    });
    screen.on('display-removed', () => {
        moveWin();
    });
    screen.on('display-metrics-changed', () => {
        moveWin();
    });
    moveWin();
};

const startPopup = async (mainWindow, css, config) => {
    const win = new BrowserWindow({
        frame: false,
        skipTaskbar: true,
        resizable: false,
        x: 0,
        y: 0,
        width: config.width || 40,
        height: config.height || 40,
    });
    watchForPosition(win, 'popup', config);
    win.webContents.openDevTools();
    win.setAlwaysOnTop(true);
    return new Promise((ok, err) => {
        ipcMain.once('popup-opened', () => {
            win.webContents.send('init', css, config); 
            ok({
                load(data) {
                    // console.log('Will load data to popup:', data);
                    win.webContents.send('data', data); 
                }
            });
        });
        win.loadURL('file://' + __dirname + '/popup.html');
    });
};

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
    let popupWindow;
    ipcMain.on('popup-open', async (event, css, data, config) => {
        popupWindow = await startPopup(mainWindow, css, config || {});
        popupWindow.load(data);
    });
    ipcMain.on('popup-update', (event, data) => {
        if (popupWindow) popupWindow.load(data);
    });
    ipcMain.on('popup-raise', (event, add) => {
        mainWindow.show();
    });

    mainWindow.loadURL('file://' + __dirname + '/desktop.html');
    mainWindow.on('closed', () => {
        app.quit();
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
