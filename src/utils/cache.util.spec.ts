import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { GenericEntity } from '../entities/generic';
import { TestService } from './cache.util.test';
import { sleep } from '../utils';
import { CacheUtil } from './cache.util';

import { DatabaseModule } from '../../test/src/modules/database/database.module';

describe('Cache Crud Service', () => {
    let service: TestService;
    let repository: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                DatabaseModule({}),
                TypeOrmModule.forFeature([GenericEntity]),
                CacheModule.register({
                    isGlobal: true,
                }),
            ],
            providers: [CacheUtil, TestService],
        }).compile();

        service = module.get<TestService>(TestService);
        repository = module.get(getRepositoryToken(GenericEntity));
    });

    describe('cache key', () => {
        it('should get key for method name', async () => {
            const methodName = 'test';
            const cacheKey = service.cache.generateKey(methodName);

            expect(cacheKey.length).toBeGreaterThan(20);
            expect(cacheKey.indexOf('##')).toBeGreaterThan(0);
            expect(cacheKey.substring(0, cacheKey.indexOf('##'))).toEqual([TestService.name, methodName].join('#'));
        });

        it('should get key for method name and id', async () => {
            const methodName = 'test';
            const cacheKeyA = service.cache.generateKey(methodName, 'A');
            const cacheKeyB = service.cache.generateKey(methodName, 'B');

            expect(cacheKeyA).not.toEqual(cacheKeyB);
            expect(cacheKeyA.indexOf('##')).toBeLessThan(0);
        });
    });

    describe('cache result', () => {
        it('should get data from callback', async () => {
            const count = 2;
            const cacheKey = service.cache.generateKey('test');

            let called = 0;
            const callback = async () => {
                called++;
                return await service.count();
            };

            jest.spyOn(repository, 'count').mockResolvedValueOnce(count);
            expect(await service.cache.result(cacheKey, callback)).toEqual(count);
            expect(called).toEqual(1);
        });

        it('should get data from cache', async () => {
            const count = 2;
            const cacheKey = service.cache.generateKey('test');

            let called = 0;
            const callback = async () => {
                called++;
                return await service.count();
            };

            // store on cache
            jest.spyOn(repository, 'count').mockResolvedValueOnce(count);
            expect(await service.cache.result(cacheKey, callback)).toEqual(count);
            expect(called).toEqual(1);
            // consume from cache
            jest.spyOn(repository, 'count').mockResolvedValueOnce(count + 1);
            expect(await service.cache.result(cacheKey, callback)).toEqual(count);
            expect(called).toEqual(1);
        });

        it('should diff cache by id', async () => {
            const countA = 2;
            const countB = 3;
            const cacheKeyA = service.cache.generateKey('test', countA);
            const cacheKeyB = service.cache.generateKey('test', countB);

            let called = 0;
            const callback = async () => {
                called++;
                return await service.count();
            };

            // consume and store on cache: A
            jest.spyOn(repository, 'count').mockResolvedValueOnce(countA);
            expect(await service.cache.result(cacheKeyA, callback)).toEqual(countA);
            expect(called).toEqual(1);
            // consume and store on cache: B
            jest.spyOn(repository, 'count').mockResolvedValueOnce(countB);
            expect(await service.cache.result(cacheKeyB, callback)).toEqual(countB);
            expect(called).toEqual(2);
            // consume cache: A
            jest.spyOn(repository, 'count').mockResolvedValueOnce(countA + 1);
            expect(await service.cache.result(cacheKeyA, callback)).toEqual(countA);
            expect(called).toEqual(2);
        });
    });

    describe('cache ttl', () => {
        it('should expire cache', async () => {
            const count = 2;
            const cacheKey = service.cache.generateKey('test');

            let called = 0;
            const callback = async () => {
                called++;
                return await service.count();
            };

            // consume and store
            jest.spyOn(repository, 'count').mockResolvedValueOnce(count);
            expect(await service.cache.result(cacheKey, callback, 1)).toEqual(count);
            expect(called).toEqual(1);
            // cache expires
            await sleep(1001);
            // consume and store again
            jest.spyOn(repository, 'count').mockResolvedValueOnce(count + 1);
            expect(await service.cache.result(cacheKey, callback, 1)).toEqual(count + 1);
            expect(called).toEqual(2);
        });
    });
});
