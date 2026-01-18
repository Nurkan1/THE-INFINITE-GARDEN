const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');



const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        fullscreen: false, // Start windowed, user can toggle? Or full for retro feel.
        autoHideMenuBar: true,
        backgroundColor: '#050505', // Match CSS
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simple prototype. Better to use preload in prod.
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // Fullscreen for immersion
    mainWindow.maximize();

    // Load the app.
    // In Dev, load localhost. In Prod, load index.html
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
