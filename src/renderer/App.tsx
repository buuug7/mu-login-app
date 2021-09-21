/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from 'react-router-dom';

import './App.global.css';

declare global {
  interface Window {
    electron: any;
  }
}

const { electron } = window;

const Index = () => {
  const [muFolder, setMuFolder] = useState('');
  const [ipAndPort, setIpAndPort] = useState('');

  useEffect(() => {
    electron.ipcRenderer.once('GET_USER_DATA', (data: any) => {
      console.log(data);
      if (data.muFolder) {
        setMuFolder(data.muFolder);
      }
      if (data.ipAndPort) {
        setIpAndPort(data.ipAndPort);
      }
    });

    electron.ipcRenderer.getUserData();
  }, []);

  return (
    <div className="index-page">
      <div className="header">
        <h2 className="text-center">土鳖奇迹登录器</h2>
      </div>

      <div className="text-center text-muted mt-3 mb-3">
        <div>F8右键挂机, F7一键连击</div>
        <div>取消请再次按相同快捷键</div>
      </div>

      <div className="body container">
        <div className="text-center">
          <div>千里修书只为墙，让他三尺又何妨。</div>
          <div>万里长城今犹在，不见当年秦始皇。</div>
        </div>
      </div>

      <div className="flex-center actions">
        <button
          type="button"
          className="btn btn-primary me-1"
          onClick={() => {
            if (!muFolder) {
              window.alert('请在设置中选择Mu客户端目录');
              return;
            }
            electron.ipcRenderer.runMu(muFolder, ipAndPort);
          }}
        >
          启动游戏
        </button>
        <Link to="/setting" className="btn btn-outline-primary">
          参数设置
        </Link>
      </div>

      <div className="footer text-muted text-center">
        <a href="http://mu.yoursoups.com/" target="_blank" rel="noreferrer">
          土鳖奇迹网站
        </a>
        <div>一个有脾气的登录器 v1.2.0</div>
      </div>
    </div>
  );
};

function SettingPage() {
  const history = useHistory();
  const [ID, setID] = useState('');
  const [Resolution, setResolution] = useState(1);
  const [MusicOnOff, setMusicOnOff] = useState(1);
  const [SoundOnOff, setSoundOnOff] = useState(1);
  const [WindowMode, setWindowMode] = useState(1);
  const [ColorDepth, setColorDepth] = useState(1);
  const [muFolder, setMuFolder] = useState('');
  const [ipAndPort, setIpAndPort] = useState('');
  const [Message, setMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const onResolutionChange = (e: any) => {
    setResolution(Number(e.target.value));
  };

  const onColorDepthChange = (e: any) => {
    setColorDepth(Number(e.target.value));
  };

  useEffect(() => {
    electron.ipcRenderer.once('GET_USER_REGEDIT_CONFIG', (data: any) => {
      setID(data.ID.value);
      setResolution(data.Resolution.value);
      setMusicOnOff(data.MusicOnOff.value);
      setSoundOnOff(data.SoundOnOff.value);
      setWindowMode(data.WindowMode.value);
      setColorDepth(data.ColorDepth.value);
    });

    electron.ipcRenderer.getRegedit();

    electron.ipcRenderer.once('GET_USER_DATA', (data: any) => {
      if (data.muFolder) {
        setMuFolder(data.muFolder);
      }

      if (data.ipAndPort) {
        setIpAndPort(data.ipAndPort);
      }
    });

    electron.ipcRenderer.getUserData();
  }, []);

  return (
    <div className="setting-page container">
      <h4>设置</h4>
      <div className="">
        <h5>分辨率</h5>
        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Resolution"
              value={1}
              checked={Resolution === 1}
              onChange={onResolutionChange}
            />
            <label className="form-check-label">800x600</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Resolution"
              value={2}
              checked={Resolution === 2}
              onChange={onResolutionChange}
            />
            <label className="form-check-label">1024x768</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Resolution"
              value={3}
              checked={Resolution === 3}
              onChange={onResolutionChange}
            />
            <label className="form-check-label" htmlFor="Resolution3">
              1280x1024
            </label>
          </div>
        </div>

        <h5>图像质量</h5>
        <div className="mb-3">
          <div className="form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="ColorDepth"
              value={0}
              checked={ColorDepth === 0}
              onChange={onColorDepthChange}
            />
            <label className="form-check-label">16bit</label>
          </div>
          <div className="form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="ColorDepth"
              value={1}
              checked={ColorDepth === 1}
              onChange={onColorDepthChange}
            />
            <label className="form-check-label">32bit</label>
          </div>
        </div>

        <h5>其他</h5>
        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={WindowMode === 1}
              onChange={(e) => {
                console.log(e.target.checked);
                setWindowMode(e.target.checked ? 1 : 0);
              }}
            />
            <label className="form-check-label">窗口模式</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={MusicOnOff === 1}
              onChange={(e) => {
                console.log(e.target.checked);
                setMusicOnOff(e.target.checked ? 1 : 0);
              }}
            />
            <label className="form-check-label">音效</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={SoundOnOff === 1}
              onChange={(e) => {
                console.log(e.target.checked);
                setSoundOnOff(e.target.checked ? 1 : 0);
              }}
            />
            <label className="form-check-label">声音</label>
          </div>
        </div>

        <h5>选择MU客户端目录</h5>
        <div className="mb-3">
          <button
            className="btn btn-light"
            type="button"
            onClick={() => {
              electron.ipcRenderer.selectFolder();
              electron.ipcRenderer.on('SELECT_FOLDER', (data: any) => {
                const folder = data.filePaths[0];
                setMuFolder(folder);
              });
            }}
          >
            选择目录
          </button>
          <div className="ps-2">{muFolder}</div>
        </div>

        <h5>IP和端口</h5>
        <div className="mb-3">
          <label className="form-label">格式 192.168.1.21:44405</label>
          <input
            type="text"
            className="form-control"
            value={ipAndPort}
            onChange={(e) => {
              setIpAndPort(e.target.value);
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">用户账号</label>
          <input
            type="text"
            className="form-control"
            value={ID}
            onChange={(e) => {
              setID(e.target.value);
            }}
          />
        </div>

        {Message && <div className="alert alert-success">{Message}</div>}

        <div className="mb-3">
          <button
            type="submit"
            className="btn btn-outline-primary"
            disabled={isDownloading}
            onClick={(e) => {
              e.preventDefault();
              setIsDownloading(true);
              setMessage('');
              electron.ipcRenderer.once('DOWNLOAD_FILE', (data: any) => {
                console.log(`data`, data);
                setMessage(data);
                setIsDownloading(false);
              });

              electron.ipcRenderer.downloadFile();
            }}
          >
            {isDownloading ? '下载中...' : '更新客户端'}
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary me-2"
            onClick={(e) => {
              e.preventDefault();
              const data = {
                ID,
                Resolution,
                MusicOnOff,
                SoundOnOff,
                WindowMode,
                ColorDepth,
              };
              electron.ipcRenderer.updateMuRegedit(data);
              setMessage('保存成功');

              electron.ipcRenderer.saveUserData({
                muFolder,
                ipAndPort,
              });
            }}
          >
            保存
          </button>
          <button
            type="submit"
            className="btn btn-outline-primary me-2"
            onClick={() => {
              history.go(-1);
            }}
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/setting" component={SettingPage} />
        <Route path="/" component={Index} />
      </Switch>
    </Router>
  );
}
