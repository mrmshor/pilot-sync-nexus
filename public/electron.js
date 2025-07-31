const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // יצירת חלון ראשי
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    titleBarStyle: 'default',
    show: false
  });

  // טעינת האפליקציה
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // הצגת החלון לאחר הטעינה
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // פתיחת DevTools רק בפיתוח
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // טיפול בסגירת החלון
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // מניעת ניווט חיצוני
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== startUrl) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// יצירת תפריט אפליקציה
function createMenu() {
  const template = [
    {
      label: 'מערכת ניהול פרויקטים',
      submenu: [
        {
          label: 'אודות',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'אודות',
              message: 'מערכת ניהול פרויקטים Pro',
              detail: 'אפליקציית שולחן למק עם תמיכה מלאה בעברית'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'יציאה',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'עריכה',
      submenu: [
        { label: 'בטל', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'חזור', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'גזור', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'העתק', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'הדבק', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'בחר הכל', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
      ]
    },
    {
      label: 'תצוגה',
      submenu: [
        { label: 'רענן', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'מסך מלא', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'חלון',
      submenu: [
        { label: 'מזער', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'סגור', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// אירועי אפליקציה
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});