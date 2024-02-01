import { Inject, Injectable } from '@nestjs/common';
import { GenericEntity } from '../entities/generic';
import { CacheUtil } from './cache.util';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../services/crud.service';

@Injectable()
export class TestService extends CrudService<GenericEntity> {
    constructor(
        @Inject(CacheUtil) public cache: CacheUtil,
        @InjectRepository(GenericEntity) protected readonly repository
    ) {
        super();
        this.cache.set(this.constructor.name, 3600);
    }
}
