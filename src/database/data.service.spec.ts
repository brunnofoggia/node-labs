import { Test, TestingModule } from '@nestjs/testing';
import { DataServiceController } from './data.service.test';
import { TestService } from '../services/crud.service.test';
import { CacheModule } from '@nestjs/cache-manager';
import { TestDataServiceModule } from './data.service.module.test';

describe('Data Service', () => {
    let spyController: DataServiceController;
    let spyService: TestService;

    beforeEach(async () => {
        const ServiceProvider = {
            provide: TestService,
            useFactory: () => ({
                count: () => TestService,
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                CacheModule.register({
                    isGlobal: true,
                }),
                TestDataServiceModule.register({
                    isGlobal: true,
                    providers: [ServiceProvider],
                }),
            ],
            controllers: [DataServiceController],
        }).compile();

        spyController = await module.resolve<DataServiceController>(DataServiceController);
        spyService = spyController.service();
    });

    it('to be defined', () => {
        const result: any = spyService.count();
        expect(spyService).not.toBeFalsy();
        expect(result).toEqual(TestService);
    });
});
