const { contextBridge, ipcRenderer } = require('electron');
const regedit = require('regedit');

regedit.setExternalVBSLocation('resources/regedit/vbs');

/**
 * Resolution 分辨率 1=800x600, 2=1024x768, 3=1280x1024
 * MusicOnOff 音效 0=关闭, 1=打开
 * SoundOnOff 声音 0=关闭, 1=打开
 * VolumeLevel 声音大小 0 - 10
 * WindowMode 窗口模式  0=关闭, 1=打开
 * ColorDepth 图像质量  0=16bit, 1=32bit
 * @param {*} param0
 */
function updateMuRegedit({
  ID,
  Resolution = 1,
  MusicOnOff = 1,
  SoundOnOff = 1,
  VolumeLevel = 5,
  WindowMode = 1,
  ColorDepth = 1,
}) {
  regedit.putValue(
    {
      'HKCU\\Software\\Webzen\\Mu\\Config': {
        ID: {
          value: ID,
          type: 'REG_SZ',
        },
        Resolution: {
          value: Resolution,
          type: 'REG_DWORD',
        },
        MusicOnOff: {
          value: MusicOnOff,
          type: 'REG_DWORD',
        },
        SoundOnOff: {
          value: SoundOnOff,
          type: 'REG_DWORD',
        },
        VolumeLevel: {
          value: VolumeLevel,
          type: 'REG_DWORD',
        },
        WindowMode: {
          value: WindowMode,
          type: 'REG_DWORD',
        },
        ColorDepth: {
          value: ColorDepth,
          type: 'REG_DWORD',
        },
      },
    },
    (err) => {
      console.log(err);
    }
  );
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once(channel, func) {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },

    runMu() {
      ipcRenderer.send('RUN_MU');
    },

    updateMuRegedit(data) {
      updateMuRegedit(data);
    },

    getRegedit() {
      regedit.list('HKCU\\Software\\Webzen\\Mu\\Config', (err, result) => {
        ipcRenderer.send(
          'GET_USER_REGEDIT_CONFIG',
          result['HKCU\\Software\\Webzen\\Mu\\Config'].values
        );
      });
    },

    selectFolder() {
      ipcRenderer.send('SELECT_FOLDER');
    },

    saveUserData(data) {
      ipcRenderer.send('SAVE_USER_DATA', data);
    },

    getUserData() {
      ipcRenderer.send('GET_USER_DATA');
    },

    checkClientUpdate() {
      ipcRenderer.send('CHECK_CLIENT_UPDATE');
    },
  },
});
