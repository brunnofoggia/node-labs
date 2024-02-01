import _debug from 'debug';
const debug = _debug('app:monitor');

export class ProcessUtil {
    public times: any = {};
    protected static _instance: ProcessUtil;

    static instance() {
        if (!this._instance) this._instance = new ProcessUtil();
        return this._instance;
    }

    time(name) {
        return (this.times[name] = Date.now());
    }

    timeEnd(name, format = true) {
        if (!this.times[name]) {
            debug(`There is no time with the name ${name}`);
            return;
        }
        const start = this.times[name];
        const end = Date.now();
        const elapsedTime = end - start;

        this.times[name] = null;
        return format ? this.formatElapsedTime(elapsedTime) : elapsedTime;
    }

    formatElapsedTime(elapsedTime) {
        const minutes = Math.floor(elapsedTime / 60000);
        const remainingTime = elapsedTime - minutes * 60000;
        const seconds = Math.floor(remainingTime / 1000);
        const ms = remainingTime - seconds * 1000;

        const result = [];
        if (minutes > 0) {
            result.push(minutes, 'm');
            result.push(seconds, 's');
        } else if (seconds > 0) result.push(seconds, 's');
        result.push(ms, 'ms');

        return result.join('');
    }
}
