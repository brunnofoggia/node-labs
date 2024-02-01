import { Controller, Inject, Injectable, Scope } from '@nestjs/common';

import { CrudController } from '../controllers/crud.controller';
import { TestService } from '../services/crud.service.test';
import { IdInterface } from '../interfaces/id.interface';
import { DataService } from './data.service';
import { GenericDto } from '../dto/generic.dto';
import { ModuleRef } from '@nestjs/core';


@Injectable({ scope: Scope.REQUEST })
export class DataServiceTest extends DataService {

    constructor(protected moduleRef: ModuleRef) {
        super(moduleRef);
    }
}

@Controller()
export class DataServiceController extends CrudController<IdInterface, GenericDto, GenericDto> {
    @Inject(DataServiceTest) protected dataService: DataServiceTest;
    public service = () => this.dataService.get(TestService);
    protected createDto = GenericDto;
}
