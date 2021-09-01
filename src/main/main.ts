/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  globalShortcut,
} from 'electron';
import fs from 'fs';
import robot from 'robotjs';

import MenuBuilder from './menu';
import { resolveHtmlPath, downloadByUrl } from './util';

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('GET_USER_REGEDIT_CONFIG', async (event, data) => {
  event.reply('GET_USER_REGEDIT_CONFIG', data);
});

ipcMain.on('SELECT_FOLDER', async (event) => {
  const folders = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  event.reply('SELECT_FOLDER', folders);
});

ipcMain.on('SAVE_USER_DATA', async (event, data) => {
  const userDataPath = app.getPath('userData');
  const dataPath = path.join(userDataPath, 'mu-login-app.json');
  fs.writeFileSync(dataPath, JSON.stringify(data));
  event.reply('SAVE_USER_DATA', 'save data');
});

function getUserData() {
  const userDataPath = app.getPath('userData');
  const dataPath = path.join(userDataPath, 'mu-login-app.json');
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath).toString());
  } catch (error) {
    console.log(error);
    data = {};
  }
  return data;
}

ipcMain.on('GET_USER_DATA', async (event) => {
  const data = getUserData();
  event.reply('GET_USER_DATA', data);
});

ipcMain.on('DOWNLOAD_FILE', async (event) => {
  const userData = getUserData();
  const { muFolder } = userData;

  const urls = [
    `http://mu.yoursoups.com/client-updates/Item.bmd`,
    `http://mu.yoursoups.com/client-updates/itemsetoption.bmd`,
    `http://mu.yoursoups.com/client-updates/itemsettype.bmd`,
  ];
  const localPath = `${muFolder}\\Data\\Local`;
  let message = '更新成功';

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const itemUrl of urls) {
      // eslint-disable-next-line no-await-in-loop
      await downloadByUrl(itemUrl, localPath);
    }
  } catch (error) {
    message = '异常,请重试';
  }

  event.reply('DOWNLOAD_FILE', message);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 320,
    height: 450,
    autoHideMenuBar: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // @TODO: Use 'ready-to-show' event
  // https://github.com/electron/electron/blob/main/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  let isF8Down = false;
  globalShortcut.register('F8', () => {
    console.log(`isF8Down`, isF8Down);

    if (!isF8Down) {
      robot.mouseToggle('down', 'right');
      isF8Down = true;
    } else {
      robot.mouseToggle('up', 'right');
      isF8Down = false;
    }
  });

  let timerF7: any = null;
  globalShortcut.register('F7', () => {
    console.log(`timerF7`, timerF7);
    // robot.setKeyboardDelay(50);

    if (timerF7) {
      clearInterval(timerF7);
      timerF7 = null;
      robot.mouseToggle('up', 'right');
    } else {
      robot.mouseToggle('down', 'right');
      timerF7 = setInterval(() => {
        robot.keyTap('1');
        robot.keyTap('2');
      }, 30);
    }
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
  console.log(`window is closed!!!!`);
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
