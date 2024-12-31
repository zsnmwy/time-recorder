import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { BASE_PATH } from './constant';
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
    const params = [
      '-f', 'pulse', '-i', '0', '-c:a', 'pcm_s16le',
      '-y',
      '-framerate',
      '12',
      '-f',
      'x11grab',
      '-s',
      `${width}x${height}`,
      '-i',
      // xvfb._display,
      ':' + display,
      '-c:v',
      'libvpx',
      '-quality',
      'realtime',
      '-cpu-used',
      '0',
      '-b:v',
      '384k',
      '-qmin',
      '10',
      '-qmax',
      '42',
      '-maxrate',
      '384k',
      '-bufsize',
      '1024k',
      '-draw_mouse',
      '0',
      `${BASE_PATH}${key}/screen.webm`,
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
