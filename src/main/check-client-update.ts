import path from 'path';
import axios from 'axios';
import fs from 'fs';
import { muDefaultFolder } from './util';
import { clientUpdateUrl } from '../config';
import { getUserData, saveUserData } from './user-data';

export async function downloadByUrl(url: string, filename: string) {
  try {
    const response = await axios({
      url: encodeURI(url),
      method: 'get',
      responseType: 'stream',
    });

    const chunks: any[] = [];
    console.log(`Status: ${response.status}`);

    return await new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      response.data.on('error', (err: any) => {
        reject(err);
      });

      response.data.on('end', () => {
        const buf = Buffer.concat(chunks);
        console.log(`filename`, filename);

        fs.writeFileSync(filename, buf);
        resolve('下载成功');
      });
    });
  } catch (err: any) {
    console.log(err.response.status);
    const message = err.response
      ? `status: ${err.response.status},statusText: ${err.response.statusText}`
      : 'Unknown Error';
    return Promise.reject(new Error(message));
  }
}

export async function downloadUpdatedFiles() {
  const userData = getUserData();
  const { muFolder = muDefaultFolder, version } = userData;

  // get updated items from server
  try {
    const { data } = await axios.get(clientUpdateUrl);
    console.log(`data`, data);

    console.log(`local version: ${version}`);
    console.log(`latest version: ${data.version}`);

    if (data.version <= version) {
      const msg = `The current version is the latest, no need to update!`;
      console.log(msg);
      return msg;
    }

    let updateItems = data.items.map((item: UpdateItem) => {
      let { link } = item;
      if (data.apiVersion > 1) {
        link = (data.baseUrl || '') + item.link;
      }
      const filename = link.split('/').pop()?.split('__').join('/') || '';

      return {
        ...item,
        link,
        filename: path.join(muFolder, filename),
      };
    });

    if (data.apiVersion > 1) {
      updateItems = updateItems.filter((it: UpdateItem) => it.needUpdate);
    }

    console.log(`begin update client`);

    let errorCount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of updateItems) {
      console.log(item.link);
      try {
        // eslint-disable-next-line no-await-in-loop
        await downloadByUrl(item.link, item.filename);
      } catch (err: any) {
        console.log(err.message);
        errorCount += 1;
      }
    }

    if (errorCount === 0) {
      saveUserData({ ...userData, version: data.version });
    }
    return 'ok';
  } catch (error: any) {
    console.log('error:', error.message);
    return 'error';
  }
}

export async function run(event: Electron.IpcMainEvent) {
  const userData = getUserData();
  console.log(`userData1`, userData);
  const { muFolder = muDefaultFolder } = userData;

  if (!muFolder) {
    event.reply('CHECK_CLIENT_UPDATE', '请将该程序放置在Mu客户端目录');
    return;
  }

  const msg = await downloadUpdatedFiles();
  event.reply('CHECK_CLIENT_UPDATE', msg);
}
