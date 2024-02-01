import { DynamicModule } from '@nestjs/common';
import { DataServiceTest } from './data.service.test';


export class TestDataServiceModule {
    static register(options): DynamicModule {
        return {
            ...options,
            module: TestDataServiceModule,
            providers: [...options.providers, DataServiceTest],
            exports: [DataServiceTest],
        };
    }
}
