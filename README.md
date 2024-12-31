# Install

install deps

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    make \
    wget \
    unzip \
    gnupg \
    xvfb \
    bash \
    pulseaudio \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

add permission
```sh
adduser root pulse-access
```

start pulseaudio
https://github.com/OmGuptaIND/recorder/blob/main/pulseaudio.sh

```bash
#!/usr/bin/env bash
set -euxo pipefail

rm -rf /var/run/pulse /var/lib/pulse /root/.config/pulse

pulseaudio -D --verbose --exit-idle-time=-1 --system --disallow-exit

pactl load-module module-null-sink sink_name="grab" sink_properties=device.description="monitorOUT"

exec tail -f /dev/null
```

fetch audio source from `pactl` cmd

```log
root ➜ /workspaces/time-recorder/src $ pactl list short sources
0       auto_null.monitor       module-null-sink.c      s16le 2ch 48000Hz       SUSPENDED
```

fill the id to ffmpeg command

```js
const params = [
    '-f', 'pulse', '-i', '0' HERE, '-c:a', 'pcm_s16le',
    '....',
    '0',
    `/workspaces/time-recorder/src/screen.webm`,
]
```

Use `docker build -ti .` to build docker image.

**API List**

| path             | desc                      |
| ---------------- | ------------------------- |
| /recorder        | Create recorder task      |
| /searchCornCount | Get current server weight |
| /delete          | Delete recorder task      |

<pre>
.
├── Dockerfile
├── README.md
├── ecosystem.config.js
├── package-lock.json
├── package.json
├── server.log
├── shell
│   └── dev-start.sh
├── src
│   ├── @types
│   │   └── lib.d.ts
│   ├── index.ts
│   ├── routes
│   │   ├── delete.ts
│   │   ├── processLock.ts
│   │   └── recorder.ts
│   ├── rpc
│   │   └── api.ts
│   ├── types
│   │   └── index.d.ts
│   └── util
│       ├── constant.ts
│       ├── cron.ts
│       ├── ffmpeg.ts           //node call ffmpeg
│       ├── log.ts							//Recorder log
│       ├── promisify.ts		
│       ├── puppeteer.ts				//Recorder entry
│       ├── task.ts							//Task cache
│       ├── timeConvert.ts			//Cron job time converter
│       └── xvfb.ts							//Custom node call xvfb
├── tsconfig.json
└── yarn.lock
</pre>
