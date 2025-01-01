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
      "-nostdin",
      "-thread_queue_size", "4096",
      '-video_size', `${width}x${height}`,
      '-draw_mouse',
      '0',
      '-f', 'x11grab',
      '-i', ':' + display,
      '-f', 'pulse', '-i', await getFirstSourceIndex() as string,
      '-c:v', 'libx264',
      "-vf", "scale=1280:720",
      '-preset', 'ultrafast', // 编码器预设为最快速度
      '-threads', '4',
      '-crf', '23', // 设置码率控制模式/恒定速率因子模式为23
      '-c:a', 'aac',
      '-b:a', '128k', // 设置音频比特率为128kbps
      '-async', '1',
      '-f', 'mp4',
      '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
      "-bufsize", "2M",
      "-flush_packets", "1",
      "-y",
      "pipe:1",

      `${BASE_PATH}${key}/screen.mp4`,
    ]
    console.log(`ffmpeg params`, params.join(` `))
    const ffmpeg = spawn('ffmpeg', params);

    ffmpeg.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`${data}`);
    });

    ffmpeg.on('close', (code) => {
      console.log(`ffmpeg exited with code ${code}`);
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
