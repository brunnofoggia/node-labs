import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';

import { TestController, ForbidNonWhitelistedController } from './crud.controller.test';
import { TestService } from '../services/crud.service.test';
import { GenericDto } from '../dto/generic.dto';

import { DataService } from '../../test/src/modules/database/data.service';

describe('Crud Controller', () => {
    let spyController: TestController;
    let spyDataService: DataService;
    let spyService: TestService;
    let module: TestingModule;

    beforeEach(async () => {
        const ServiceProvider = {
            provide: TestService,
            useFactory: () => ({
                getIdAttribute: jest.fn(),
                count: jest.fn(),
                find: jest.fn(),
                findById: jest.fn(),
                findAll: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                remove: jest.fn(),
            }),
        };

        module = await Test.createTestingModule({
            imports: [
                CacheModule.register({
                    isGlobal: true,
                }),
            ],
            controllers: [TestController, ForbidNonWhitelistedController],
            providers: [ServiceProvider],
        }).compile();

        spyController = module.get<TestController>(TestController);
        spyService = module.get<TestService>(TestService);
    });

    describe('create', () => {
        it('calling create method', async () => {
            const dto = new GenericDto();
            expect(await spyController._create(dto, {})).not.toEqual(null);
            expect(spyService.create).toHaveBeenCalled();
            expect(spyService.create).toHaveBeenCalledWith(dto, {});
        });
    });

    describe('count', () => {
        it('calling count method', async () => {
            await spyController._count();
            expect(spyService.count).toHaveBeenCalled();
        });
    });

    describe('find', () => {
        it('calling find method', async () => {
            await spyController._find();
            expect(spyService.find).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('found', async () => {
            const create = { id: 1 };
            jest.spyOn(spyService, 'findById').mockResolvedValueOnce(create);
            expect(await spyController._findById(1)).toMatchObject(create);
            expect(spyService.findById).toHaveBeenCalled();
        });

        it('not found', async () => {
            jest.spyOn(spyService, 'findById').mockResolvedValueOnce(null);
            try {
                await spyController._findById(1);
            } catch (err) {
                expect(err.status).toBe(404);
            }
            expect(spyService.findById).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('calling update method', async () => {
            jest.spyOn(spyService, 'getIdAttribute').mockReturnValue('id');
            const dto = new GenericDto();
            const id = 1;
            await spyController._update(id, dto);
            expect(spyService.update).toHaveBeenCalled();
            expect(spyService.update).toHaveBeenCalledWith(dto);
        });
    });

    describe('remove', () => {
        it('calling remove method', async () => {
            const id = 1;
            await spyController._remove(id);
            expect(spyService.remove).toHaveBeenCalled();
        });
    });

    describe('whitelist', () => {
        it('should transform and/or exclude properties', async () => {
            const create = { id: 1 };
            const dto: any = { id: '1' };
            dto.admin = true;

            expect(await spyController._create(dto, {})).not.toEqual(null);
            expect(spyService.create).toHaveBeenCalled();
            expect(spyService.create).toHaveBeenCalledWith(create, {});
        });
    });

    describe('forbid non whitelisted', () => {
        it('should throw error', async () => {
            const spyController = module.get<ForbidNonWhitelistedController>(ForbidNonWhitelistedController);
            const create: any = { id: 1 };
            create.admin = true;

            try {
                await spyController._create(create, {});
            } catch (err) {
                expect(() => {
                    throw err;
                }).toThrowError();
            }
        });
    });
});
