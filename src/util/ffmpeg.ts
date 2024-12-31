import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { BASE_PATH } from './constant';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdirSync } from 'fs';
const exec = promisify(execFile);

async function getFirstSourceIndex() {
  try {
    const { stdout, stderr } = await exec('sh', ['-c', 'pactl list short sources | awk \'{print $1}\'']);
    if (stderr) {
      throw new Error(`命令执行错误: ${stderr}`);
    }
    const firstSourceIndex = stdout.trim();
    console.log(`第一个音频源的索引号是: ${firstSourceIndex}`);
    return firstSourceIndex;
  } catch (error: any) {
    console.error(`执行命令出错: ${error.message}`);
  }
}

class FFmpeg {
  private ffmpeg: {
    [key: string]: ChildProcessWithoutNullStreams;
  } = {};

  setFFmpeg = (key: string, process: ChildProcessWithoutNullStreams) => {
    this.ffmpeg[key] = process;
  };

  getFFmpeg = (key: string) => {
    return this.ffmpeg[key];
  };

  getFFmpegs = () => this.ffmpeg;
}

const ffmpegIns = new FFmpeg();

export const startRecorder = async (key: string, display: number, option: { width: number; height: number }) => {
  const { width, height } = option;

  try {
    mkdirSync(`${BASE_PATH}${key}`, {
      recursive: true
    })
  } catch (error) {
    console.error("fail to mkdir", error)
  }

  try {
    const params = [
      '-f', 'pulse', '-i', await getFirstSourceIndex() as string, '-c:a', 'pcm_s16le',
      '-y',
      '-framerate',
      '60',
      '-f',
      'x11grab',
      '-s',
      `${width}x${height}`,
      '-draw_mouse',
      '0',
      '-i',
      // xvfb._display,
      ':' + display,
      '-c:v',
      'libx264',
      '-preset', 'medium', // 编码器预设为中等速度
      '-profile:v', 'high', // 指定编码器配置文件为high
      '-level:v', '4.1', // 指定编码器级别为4.1
      '-crf', '23', // 设置码率控制模式/恒定速率因子模式为23
      '-acodec', 'aac', // 指定音频编码器为aac
      '-ar', '44100', // 设置音频采样率为44100Hz
      '-ac', '2', // 设置音频通道数为2，即立体声
      '-b:a', '192k', // 设置音频比特率为128kbps
      '-bufsize', '2048k', // 缓冲区大小

      `${BASE_PATH}${key}/screen.mp4`,
    ]
    console.log(`ffmpeg params`, params.join(` `))
    const ffmpeg = spawn('ffmpeg', params);

    ffmpeg.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    ffmpegIns.setFFmpeg(key, ffmpeg);
    return Promise.resolve();
  } catch (error) {
    console.log(error);
    return Promise.reject();
  }
};

export const ffmpegStop = async (key: string) => {
  const ffmpeg = ffmpegIns.getFFmpeg(key);
  return ffmpeg.kill();
};

export default ffmpegIns;
