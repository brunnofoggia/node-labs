import { DynamicModule } from '@nestjs/common';
import { DataService } from './data.service';


export class TestDataServiceModule {
    static register(options): DynamicModule {
        return {
            ...options,
            module: TestDataServiceModule,
            providers: [...options.providers, DataService],
            exports: [DataService],
        };
    }
}
