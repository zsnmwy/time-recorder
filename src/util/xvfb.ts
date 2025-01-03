import * as process from 'child_process';
class XvfbMap {
  private xvfb: {
    [key: string]: {
      process: process.ChildProcessWithoutNullStreams;
      display: number;
      execPath?: string;
    };
  } = {};

  setXvfb = (key: string, display: number, process: process.ChildProcessWithoutNullStreams, execPath?: string) => {
    this.xvfb[key] = {
      display,
      process,
      execPath,
    };
  };

  getSpecXvfb = (key: string) => {
    return this.xvfb[key];
  };

  getXvfb = () => this.xvfb;
}

const xvfbIns = new XvfbMap();

/**
 * 检测虚拟桌面是否运行
 * @param num 虚拟桌面窗口编号
 * @param execPath 内存缓冲文件映射路径
 * @returns Promise<boolean>
 */
const checkoutDisplay = (num: number, execPath?: string) => {
  const path = execPath || '/dev/null';
  return new Promise<boolean>((res, rej) => {
    const xdpyinfo = process.spawn('xdpyinfo', [
      '-display',
      `:${num}>${path}`,
      '2>&1',
      '&&',
      'echo',
      'inUse',
      '||',
      'echo',
      'free',
    ]);
    xdpyinfo.stdout.on('data', (data) => res(data.toString() === 'inUse'));
    xdpyinfo.stderr.on('data', (data) => rej(data.toString()));
  });
};

const getRunnableNumber = async (execPath?: string): Promise<number> => {
  const num = Math.floor(62396 * Math.random());
  const isValid = await checkoutDisplay(num, execPath);
  if (isValid) {
    return num;
  } else {
    return getRunnableNumber(execPath);
  }
};

export const xvfbStart = async (
  key: string,
  option: { width: number; height: number; depth: 15 | 16 | 24 },
  execPath?: string
) => {
  const randomNum = Math.floor(62396 * Math.random());
  const { width, height, depth } = option;
  try {
    const xvfb = process.spawn('Xvfb', [
      `:${randomNum}`,
      '-screen',
      '0',
      `${width}x${height}x${depth}`,
      '-ac',
      '-noreset',
    ]);

    xvfbIns.setXvfb(key, randomNum, xvfb, execPath);

    xvfb.stdout.on('data', (data) => {
      console.log(`xvfb stdout: ${data}`);
    });

    xvfb.stderr.on('data', (data) => {
      console.log(`xvfb stderr: ${data}`);
    });

    xvfb.on('close', (code) => {
      console.log(`xvfb child process exited with code ${code}`);
    });

    return randomNum;
  } catch (error) {
    console.log(error);
    return 99;
  }
};

export const xvfbStop = (key: string) => {
  const xvfb = xvfbIns.getSpecXvfb(key);
  return xvfb.process.kill();
};

export default xvfbIns;
