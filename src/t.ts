import { xvfbStart, xvfbStop } from "./util/xvfb";
import * as puppeteer from 'puppeteer';
import { ffmpegStop, startRecorder } from "./util/ffmpeg";
import * as fs from 'fs';

; (async () => {

    const date = `happy-date`;
    try {
        const width = 1280;
        const height = 720;
        const display = await xvfbStart(date, {
            width,
            height,
            depth: 24,
        });

        console.log(`display ${display}`)


        await new Promise((r) => setTimeout(r, 10 * 1000));

        startRecorder(date, display, {
            width,
            height,
        });
        
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
        

        await page.goto("https://cn-ahhf-ct-01-02.bilivideo.com/upgcxcode/39/10/27624671039/27624671039-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&uipk=5&nbs=1&deadline=1735740519&gen=playurlv2&os=bcache&oi=730790904&trid=00008a7c8646a5cf42b9acd188c19841bf56h&mid=0&platform=html5&og=hw&upsig=1a9a5cb8141da1a1991a55a0a4cad2b2&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform,og&cdnid=88402&bvc=vod&nettype=0&f=h_0_0&bw=43778&logo=80000000")
        // await page.waitForSelector('div');
        // await page.waitForSelector('div');
        await page.setBypassCSP(true);

        console.log('start to record')

        // await new Promise((r) => setTimeout(r, 60 * 1000));

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