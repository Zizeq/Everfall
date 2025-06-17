// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1000, // You can adjust these dimensions to fit your game's preferred resolution
        height: 800,
        webPreferences: {
            // 'preload' script runs before your web page starts rendering.
            // It's a good practice for security, but for simple games,
            // 'nodeIntegration: true' and 'contextIsolation: false' might be used for simplicity,
            // though it's less secure.
            // If you don't have a specific preload script, you can remove this line.
            preload: path.join(__dirname, 'preload.js'),

            // Enable Node.js integration. Be aware of security implications.
            // For a trusted local application, this is often acceptable.
            nodeIntegration: true,

            // If nodeIntegration is true, contextIsolation should generally be false
            // unless you explicitly use a preload script to expose specific APIs.
            contextIsolation: false
        }
    });

    // Load your index.html file.
    // The 'file://' protocol is used to load local files.
    win.loadFile('index.html');

    // Optional: Open the DevTools.
    // This is useful for debugging your game within the Electron window.
    // Uncomment the line below to enable it.
    // win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});