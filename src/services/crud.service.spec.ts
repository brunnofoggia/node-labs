import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { create, idResponse, item } from '../../test/mocks/crud.service.mock';
import { CacheModule } from '@nestjs/cache-manager';
import { GenericEntity } from '../entities/generic';
import { TestService } from './crud.service.test';

import { DatabaseModule } from '../../test/src/modules/database/database.module';
import { defaults, omit, pick, result } from 'lodash';
import { HttpStatusCode } from 'axios';

describe('Crud Service', () => {
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
            providers: [TestService],
        }).compile();

        service = module.get<TestService>(TestService);
        repository = module.get(getRepositoryToken(GenericEntity));

        service['setDeleteRecords'] = function (v) {
            return (this._shouldApplyDeletedAt = v);
        };
        service['setDeleteRecords'](false);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('count', () => {
        it('should return total of rows', async () => {
            const count = 2;
            jest.spyOn(repository, 'count').mockResolvedValueOnce(count);
            expect(await service.count()).toEqual(count);
        });
    });

    describe('findById', () => {
        it('should return an enterprise', async () => {
            jest.spyOn(repository, 'find').mockResolvedValueOnce([item]);
            expect(await service.findById(idResponse.id)).toEqual(item);
        });
    });

    describe('find (find all)', () => {
        it('should return a list of companies', async () => {
            const result = [item];
            jest.spyOn(repository, 'find').mockResolvedValueOnce(result);
            expect(await service.findAll()).toEqual(result);
        });
        it('should return an empty array', async () => {
            const result = [];
            jest.spyOn(repository, 'find').mockResolvedValueOnce(result);
            expect(await service.findAll()).toEqual(result);
        });
    });

    describe('create', () => {
        it('should return the id', async () => {
            jest.spyOn(repository, 'find').mockResolvedValueOnce([]);
            jest.spyOn(repository, 'create').mockImplementationOnce((entity) => {
                return entity;
            });
            jest.spyOn(repository, 'save').mockImplementationOnce((entity) => {
                entity['id'] = idResponse.id;
            });
            const result = await service.create(create, {});
            expect(result).toEqual(idResponse);
        });

        it('should return the entity', async () => {
            jest.spyOn(repository, 'find').mockResolvedValueOnce([]);
            jest.spyOn(repository, 'find').mockResolvedValueOnce([create]);
            jest.spyOn(repository, 'create').mockImplementationOnce((entity) => {
                return entity;
            });
            jest.spyOn(repository, 'save').mockImplementationOnce((entity) => {
                entity['id'] = idResponse.id;
            });
            const result = await service.create(create, { find: 1 });
            expect(result).toEqual(create);
        });

        it('should throw an exception', async () => {
            const error = { code: '999' };

            jest.spyOn(repository, 'find').mockResolvedValueOnce([]);
            jest.spyOn(repository, 'create').mockImplementationOnce((entity) => {
                return entity;
            });
            jest.spyOn(repository, 'save').mockImplementationOnce(() => {
                throw error;
            });

            try {
                await service.create(create, {});
            } catch (err) {
                expect(err.code).toEqual(error.code);
            }
        });
    });

    describe('update', () => {
        it('should return the id', async () => {
            jest.spyOn(repository, 'find').mockResolvedValueOnce([create]);
            jest.spyOn(repository, 'save').mockImplementationOnce((entity) => entity);
            const result = await service.update(create);
            expect(result).toEqual(idResponse);
        });

        it('should throw not found', async () => {
            expect.assertions(1);
            const _err = { status: HttpStatusCode.NotFound };

            jest.spyOn(repository, 'find').mockResolvedValueOnce([]);
            await expect(service.update(create)).rejects.toThrow();
        });
    });

    describe('replace', () => {
        it('should create', async () => {
            jest.spyOn(repository, 'save').mockImplementationOnce((entity) => {
                entity['id'] = idResponse.id;
            });
            const result = await service.replace(omit(create, 'id'));
            expect(result).toEqual(idResponse);
        });

        it('should update', async () => {
            jest.spyOn(repository, 'save').mockImplementationOnce((entity) => {
                entity['id'] = idResponse.id;
            });
            const result = await service.replace(create);
            expect(result).toEqual(idResponse);
        });
    });

    describe('delete', () => {
        it('should return the id', async () => {
            jest.spyOn(repository, 'find').mockResolvedValueOnce([item]);
            jest.spyOn(repository, 'delete').mockResolvedValueOnce(idResponse);
            const result = await service.delete(idResponse.id);

            expect(result).toEqual(idResponse);
        });

        it('should throw an exception', async () => {
            const error = { code: '999' };

            jest.spyOn(repository, 'find').mockResolvedValueOnce([item]);
            jest.spyOn(repository, 'delete').mockImplementation(() => {
                throw error;
            });

            try {
                await service.delete(idResponse.id);
            } catch (err) {
                expect(err.code).toEqual(error.code);
            }
        });
    });

    describe('deletedAt', () => {
        it('should not add field', async () => {
            service['setDeleteRecords'](false);
            jest.spyOn(service, 'shouldApplyDeletedAt').mockReturnValueOnce(false);
            const _item = defaults({}, item);
            const result = await service.deletedAt(_item);

            expect(result).toEqual(item);
        });

        it('should add field', async () => {
            service['setDeleteRecords'](true);
            const propertyName = 'deletedAt';
            jest.spyOn(service, 'shouldApplyDeletedAt').mockReturnValueOnce(true);
            jest.spyOn(service, 'findMetadata').mockReturnValueOnce({ propertyName });
            const _item = defaults({}, item);
            const _result = await service.deletedAt(_item);
            const value = result(_result, propertyName);

            const test = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/.test(value + '');
            console.log(value);

            expect(!!value).toBeTruthy();
            expect(test).toBeTruthy();
        });
    });

    describe('hide', () => {
        it('should hide and return the id', async () => {
            service['setDeleteRecords'](true);
            jest.spyOn(repository, 'find').mockResolvedValueOnce([item]);
            jest.spyOn(repository, 'save').mockResolvedValueOnce(idResponse);
            const result = await service.hide(idResponse.id);

            expect(result).toEqual(idResponse);
        });
    });

    describe('updatedAt', () => {
        it('should not add field', async () => {
            jest.spyOn(service, 'shouldApplyManualUpdatedAt').mockReturnValueOnce(false);
            const _item = defaults({}, item);
            const result = await service.updatedAt(_item);

            expect(result).toEqual(item);
        });

        it('should add field', async () => {
            const propertyName = 'updatedAt';
            jest.spyOn(service, 'shouldApplyManualUpdatedAt').mockReturnValueOnce(true);
            jest.spyOn(service, 'findMetadata').mockReturnValueOnce({ propertyName });
            const _item = defaults({}, item);
            const _result = await service.updatedAt(_item);

            const test = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/.test(result(_result, propertyName) + '');
            expect(test).toBeTruthy();
        });
    });
});
