import { ModuleRef } from '@nestjs/core';

export abstract class DataService {
    protected loaded = [];

    constructor(protected moduleRef: ModuleRef) { }

    protected load(Service: any) {
        !this.loaded[Service.name] && (this.loaded[Service.name] = this.moduleRef.get(Service));
        return this.loaded[Service.name];
    }

    get(Service: any) {
        return this.load(Service);
    }
}
