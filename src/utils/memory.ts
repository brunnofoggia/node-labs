import _debug from 'debug';
const debug = _debug('app:monitor');

export class MemoryUtil {
    protected memoryUsage = 0;
    protected _memoryInterval;
    protected _debug = 0;
    protected static _instance: MemoryUtil;

    static instance() {
        if (!this._instance) this._instance = new MemoryUtil;
        return this._instance;
    }

    debug() {
        this._debug = 1;
        return this;
    }

    memoryCalc() {
        const memoryUsage = process.memoryUsage();
        if (memoryUsage.rss > this.memoryUsage) {
            this.memoryUsage = memoryUsage.rss;
        }

        if (this._debug)
            debug(`Uso de memória: ${this.formatMemory(memoryUsage.rss)}MB`);
    }

    memoryInterval(ms = 100) {
        clearInterval(this._memoryInterval);
        this.memoryUsage = 0;

        this.memoryCalc();
        this._memoryInterval = setInterval(() => this.memoryCalc(), ms);
    }

    memoryIntervalEnd() {
        this.memoryIntervalClear();
        const memoryUsage = this.formatMemory(this.memoryUsage) + 'MB';
        this.memoryUsage = 0;

        return memoryUsage;
    }

    memoryIntervalClear() {
        clearInterval(this._memoryInterval);
    }

    formatMemory(memoryUsage) {
        return (memoryUsage / (1024 * 1024)).toFixed(2);
    }

}
