const { contextBridge, ipcRenderer } = require('electron');
const child = require('child_process');
const regedit = require('regedit');

regedit.setExternalVBSLocation('resources/regedit/vbs');

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

    runMu(muFolder, ipAndPort) {
      const ipAndPortArr = ipAndPort.split(':');
      process.chdir(muFolder);
      const executablePath = `${muFolder}\\main.exe`;
      const param = ['connect', `/u${ipAndPortArr[0]}`, `/p${ipAndPortArr[1]}`];
      child.execFile(executablePath, param, (err, data) => {
        const rs = { message: '' };
        if (err) {
          console.error(err);
          rs.message = err;
        } else {
          rs.message = data.toString();
        }
      });
    },

    /**
     * Resolution 分辨率 1=800x600, 2=1024x768, 3=1280x1024
     * MusicOnOff 音效 0=关闭, 1=打开
     * SoundOnOff 声音 0=关闭, 1=打开
     * VolumeLevel 声音大小 0 - 10
     * WindowMode 窗口模式  0=关闭, 1=打开
     * ColorDepth 图像质量  0=16bit, 1=32bit
     * @param {*} param0
     */
    updateMuRegedit({
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
  },
});
