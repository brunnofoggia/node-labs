import { Injectable } from '@nestjs/common';

import { GenericEntity } from '../entities/generic';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from './crud.service';

@Injectable()
export class TestService extends CrudService<GenericEntity> {
    constructor(
        @InjectRepository(GenericEntity) protected readonly repository
    ) {
        super();
    }
}
