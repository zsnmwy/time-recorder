import { xvfbStart, xvfbStop } from "./util/xvfb";
import * as puppeteer from 'puppeteer';
import { ffmpegStop, startRecorder } from "./util/ffmpeg";
import * as fs from 'fs';

; (async () => {

    const date = `happy-date`;
    try {
        const width = 1920;
        const height = 1080;
        const display = await xvfbStart(date, {
            width,
            height,
            depth: 24,
        });

        console.log(`display ${display}`)


        await new Promise((r) => setTimeout(r, 10 * 1000));

        const browser = await puppeteer.launch({
            headless: false,
            executablePath: '/home/runner/work/time-recorder/time-recorder/ungoogled-chromium_131.0.6778.244_1.vaapi_linux/chrome',
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
                // '--disable-gpu', //GPU硬件加速
                `--window-size=${width},${height}`,
                '--start-maximized',
                '--kiosk',
            ],
            ignoreDefaultArgs: ['--enable-automation']
        });

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setViewport({
            width,
            height,
        });
        await page.goto("https://www.bilibili.com/video/BV1Gy6HY9EAN/?spm_id_from=333.1007.tianma.2-3-6.click&vd_source=1631292760ce04ac6ed39544dff2568c")
        // await page.waitForSelector('div');
        // await page.waitForSelector('div');
        await page.setBypassCSP(true);

        console.log('start to record')

        // await new Promise((r) => setTimeout(r, 60 * 1000));
        startRecorder(date, display, {
            width,
            height,
        });
        await new Promise((r) => setTimeout(r, 60 * 1000));

        const isDone = await ffmpegStop(date);

        if (!isDone) {
            throw '录制未完成';
        }

        await new Promise((r) => setTimeout(r, 3000 as number));
        await browser.close();
        await xvfbStop(date);
    } catch (error) {
        console.log(error);

        console.log('process error----', error);
        await xvfbStop(date);

    }

})()