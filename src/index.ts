import {spawn, ChildProcess} from 'node:child_process'
import {mkdir, stat, appendFile, rm} from "node:fs/promises";

const generateRandomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

const runCommand = (executablePath: string, args: string[], cwdPath: string) => {
    let child = spawn(executablePath, args, {
        cwd: cwdPath,
        stdio: "ignore",
    });
    return new Promise(r => {
        child.on("exit", r);
    });
};

class Proxy {
    private config: WarpProxy;
    private process!: ChildProcess;
    private port: number;
    private path!: string;

    constructor(config: WarpProxy, port: number) {
        this.config = config;
        this.port = port;
    }

    async startService() {
        do {
            this.path = `${__dirname}/wg/${generateRandomString(16)}`;
        } while ((await stat(this.path)).isDirectory());
        await mkdir(this.path);

        await runCommand(this.config.getWgcf(), ["register", "--accept-tos"], this.path);
        await runCommand(this.config.getWgcf(), ["generate"], this.path);

        await appendFile(`${this.path}/wgcf-profile.conf`, `[Socks5]\nBindAddress = 127.0.0.1:${this.port}`);

        this.process = spawn(this.config.getWireproxy(), ["-c", `${this.path}/wgcf-profile.conf`], {
            cwd: this.path,
            stdio: "ignore",
        });
    }

    async stopService() {
        this.process.kill(0);
        await rm(this.path, {
            recursive: true,
        });
    }
}

class WarpProxy {
    private wgcf: string;
    private wireproxy: string;

    constructor(wgcf: string, wireproxy: string) {
        this.wgcf = wgcf;
        this.wireproxy = wireproxy;
    }

    getWgcf(): string {
        return this.wgcf;
    }

    getWireproxy(): string {
        return this.wireproxy;
    }

    createProxy(port: number): Proxy {
        return new Proxy(this, port);
    }

    async init() {
        if ((await stat(`${__dirname}/wg`)).isDirectory()) {
            await rm(`${__dirname}/wg`, {
                recursive: true,
            });
        }
        await mkdir(`${__dirname}/wg`);
    }
}

export default WarpProxy;
