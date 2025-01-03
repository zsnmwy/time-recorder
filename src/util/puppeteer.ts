import * as puppeteer from 'puppeteer';
import { ImageOption } from 'types';
import { BASE_PATH, isDev } from './constant';
import { CronJob } from 'cron';
import { xvfbStart, xvfbStop } from './xvfb';
import * as fs from 'fs';
import { startRecorder, ffmpegStop } from './ffmpeg';
import { startLogRecorder, stopLogRecorder } from './log';

const converntCookie = (cookie: any) => {
  const keys = Object.keys(cookie);
  const result: puppeteer.SetCookie[] = [];
  keys.forEach((item) => {
    result.push({ name: item, value: cookie[item] });
  });
  return result;
};

interface Options extends Omit<ImageOption, 'url'> {
  url: string;
}

export const openUrls = async (options: Options, cookies: puppeteer.SetCookie, job: CronJob, date: string) => {
  const { size, url, second, startTime } = options;
  const { width, height } = size;
  fs.mkdirSync(`${BASE_PATH}${date}`);
  try {
    const display = await xvfbStart(date, {
      width,
      height,
      depth: 24,
    });

    const browser = await puppeteer.launch({
      headless: false,
      // executablePath: '/usr/bin/google-chrome',
      defaultViewport: null,
      args: [
        '--enable-usermedia-screen-capturing',
        `--auto-select-desktop-capture-source=recorder-page`,
        '--allow-http-screen-capture',
        '--ignore-certificate-errors',
        '--enable-experimental-web-platform-features',
        '--allow-http-screen-capture',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-fullscreen',
        '--display=:' + display,
        '-–disable-dev-shm-usage',
        '-–no-first-run', //没有设置首页。
        '–-single-process', //单进程运行
        '--disable-gpu', //GPU硬件加速
        `--window-size=${width},${height}`,
        '–kiosk'
      ],
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    cookies && (await page.setCookie(...converntCookie(cookies)));
    await page.setViewport({
      width: width,
      height: height,
    });

    await page.goto(url);
    await page.waitForSelector('div');
    await page.setBypassCSP(true);
    startLogRecorder(date, page);
    if (startTime && !isDev && Date.now() - Number(startTime) >= 60000) {
      await new Promise((r) => setTimeout(r, 60000 as number));
    }
    startRecorder(date, display, {
      width,
      height,
    });
    await new Promise((r) => setTimeout(r, second as number));

    const isDone = await ffmpegStop(date);
    await stopLogRecorder(date, page);
    if (!isDone) {
      throw '录制未完成';
    }

    await new Promise((r) => setTimeout(r, 3000 as number));
    await browser.close();
    await xvfbStop(date);

    job.stop();
  } catch (error) {
    console.log('process error----', error);
    fs.rmdir(`${BASE_PATH}${date}`, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
      console.log(`${date} is deleted!`);
    });
    await xvfbStop(date);
    // await updateTask({ id: task.getTask(date).id, status: -1 }, cookieString);
    job.stop();
  }
};
