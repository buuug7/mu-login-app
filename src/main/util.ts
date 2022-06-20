/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';
import axios from 'axios';
import fs from 'fs';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

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
