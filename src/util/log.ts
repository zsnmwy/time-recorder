import {
  BASE_PATH,
  // JS_ERROR_LOG_PATH, JS_LOG_PATH, NETWORK_LOG_PATH, NETWORK_SOURCE_PATH
} from './constant';
// import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
// import { ConsoleMessage, PageEventObj, Request } from 'puppeteer';
import * as xlsx from 'xlsx';

interface XlsxRowData {
  name?: number | string;
  url: string;
  headers: string;
  startTime?: string;
  endTime?: string;
  response?: string;
  spendTime?: number;
  postData?: string;
  status?: number | string;
}

// type CustomStream = string | fs.WriteStream;
interface LogSetItem {
  http: XlsxRowData[];
  websocket: XlsxRowData[];
  resource: XlsxRowData[];
  // request: XlsxRowData[];
}

interface LogSet {
  [key: string]: LogSetItem;
}

class Logs {
  private logs: LogSet = {};

  setLog = (key: string, option: LogSetItem) => {
    this.logs[key] = option;
    return this.logs[key];
  };

  getLogs = () => this.logs;

  getLog = (key: string): LogSetItem => this.logs[key];
}

const logs = new Logs();

const httpAnaylze = async (log: LogSetItem, page: puppeteer.Page) => {
  // page.on('request', (req) => {});

  page.on('requestfinished', async (req) => {
    const type = req.resourceType();
    if (type === 'xhr') {
      // log.http.push({
      //   headers: JSON.stringify(req.headers()),
      //   url: req.url(),
      //   endTime: req.response()?.headers().date || 'unknow',
      //   postData: req.postData() || 'no post param',
      //   response: (await req.response()?.text()) || 'no response content',
      //   status: req.response()?.status() || 'no status',
      // });
      const specLogIndex = log.http.findIndex((item) => item.url === req.url());
      if (specLogIndex !== -1) {
        const specLog = log.http[specLogIndex];
        specLog.endTime = req.response()?.headers().date || 'unknow';
        specLog.response = (await req.response()?.text()) || 'no response content';
        specLog.status = req.response()?.status() || 'no status';
      } else {
        log.http.push({
          headers: JSON.stringify(req.headers()),
          url: req.url(),
          endTime: req.response()?.headers().date || 'unknow',
          postData: req.postData() || 'no post param',
          response: (await req.response()?.text()) || 'no response content',
          status: req.response()?.status() || 'no status',
        });
      }
    } else {
      const specLogIndex = log.resource.findIndex((item) => item.url === req.url());
      if (specLogIndex !== -1) {
        const specLog = log.resource[specLogIndex];
        specLog.endTime = req.response()?.headers().date || 'unknow';
        specLog.response = (await req.response()?.text()) || 'no response content';
        specLog.status = req.response()?.status() || 'no status';
      } else {
        log.resource.push({
          headers: JSON.stringify(req.headers()),
          url: req.url(),
          endTime: req.response()?.headers().date || 'unknow',
          postData: req.postData() || 'no post param',
          response: (await req.response()?.text()) || 'no response content',
          status: req.response()?.status() || 'no status',
        });
      }
    }
  });
  page.on('request', async (req) => {
    const type = req.resourceType();
    const date = new Date();
    if (type === 'xhr') {
      log.http.push({
        headers: JSON.stringify(req.headers()),
        url: req.url(),
        startTime: `${date.toTimeString()}.${date.getMilliseconds()}`,
        postData: req.postData() || 'no post param',
        // status: req.response()?.status() || 'no status',
      });
    } else {
      log.resource.push({
        headers: JSON.stringify(req.headers()),
        url: req.url(),
        startTime: `${date.toTimeString()}.${date.getMilliseconds()}`,
        postData: req.postData() || 'no post param',
        // status: req.response()?.status() || 'no status',
      });
    }
  });
};

const websocketAnaylze = async (log: LogSetItem, page: puppeteer.Page) => {
  const cdp = await page.target().createCDPSession();
  await cdp.send('Network.enable');
  // await cdp.send('Page.enable');

  cdp.on('Network.webSocketClosed', function (params) {
    // console.log(`WebSocket 连接关闭`);
    const date = new Date();
    log.websocket.push({
      url: params.url || 'websocket closed',
      headers: 'websocket',
      endTime: `${date.toTimeString()}.${date.getMilliseconds()}`,
      postData: 'close',
      response: 'close SUCCESS',
      status: 200,
    });
  });
  cdp.on('Network.webSocketFrameError', function (params) {
    // console.log(`WebSocket error`, params);
    const date = new Date();
    log.websocket.push({
      url: params.url || 'websocket error',
      headers: 'websocket',
      endTime: `${date.toTimeString()}.${date.getMilliseconds()}`,
      postData: 'error',
      response: 'websocket error',
      status: 500,
    });
  });
  cdp.on('Network.webSocketCreated', (data) => {
    // console.log('trigger websocket create', data);
    const date = new Date();
    log.websocket.push({
      url: data.url || 'websocket created',
      headers: 'websocket',
      endTime: `${date.toTimeString()}.${date.getMilliseconds()}`,
      postData: 'create',
      response: 'websocket connected',
      status: 200,
    });
  });
  cdp.on('Network.webSocketFrameReceived', (data) => {
    // console.log('trigger websocket', data);
    const date = new Date();
    log.websocket.push({
      url: data.url || 'websocket received',
      headers: 'websocket',
      endTime: `${date.toTimeString()}.${date.getMilliseconds()}`,
      postData: 'create',
      response: data.response.payloadData,
      status: 200,
    });
  });
  // cdp.on('Network.webSocketFrameSent', (data) => console.log(data));
};

export const startLogRecorder = async (key: string, page: puppeteer.Page) => {
  const log = logs.setLog(key, {
    websocket: [],
    http: [],
    resource: [],
  });
  httpAnaylze(log, page);
  websocketAnaylze(log, page);
};

export const stopLogRecorder = async (key: string, page: puppeteer.Page) => {
  const log = logs.getLog(key);
  const { http, resource, websocket } = log;
  // console.log(request);
  const wb = xlsx.utils.book_new();
  wb.SheetNames.push('http');
  wb.SheetNames.push('resource');
  wb.SheetNames.push('websocket');
  const httpWS = xlsx.utils.json_to_sheet(http);
  const resourceWS = xlsx.utils.json_to_sheet(resource);
  const websocketWS = xlsx.utils.json_to_sheet(websocket);
  // wb.Sheets['request'];
  wb.Sheets['http'] = httpWS;
  wb.Sheets['resource'] = resourceWS;
  wb.Sheets['websocket'] = websocketWS;
  xlsx.writeFile(wb, `${BASE_PATH}${key}/log.xlsx`);
  page.removeAllListeners();
  // if (!(typeof jsError === 'string')) {
  //   jsError.close();
  // }
  // if (!(typeof jsLog === 'string')) {
  //   jsLog.close();
  // }
  // if (!(typeof networkLog === 'string')) {
  //   networkLog.close();
  // }
};

export default logs;
