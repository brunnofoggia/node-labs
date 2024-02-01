import { Controller, Inject } from '@nestjs/common';

import { CrudController } from '../controllers/crud.controller';
import { TestService } from '../services/crud.service.test';
import { IdInterface } from '../interfaces/id.interface';
import { GenericDto } from '../dto/generic.dto';

@Controller()
export class TestController extends CrudController<IdInterface, GenericDto, GenericDto> {
    // @Inject(DataService) protected dataService: DataService;
    @Inject(TestService) public readonly _service: TestService;
    public readonly service = () => this._service;
    protected createDto = GenericDto;
}

@Controller()
export class ForbidNonWhitelistedController extends CrudController<IdInterface, GenericDto, GenericDto> {
    // @Inject(DataService) protected dataService: DataService;
    @Inject(TestService) public readonly _service: TestService;
    public readonly service = () => this._service;
    // public readonly service = () => this.dataService.get(TestService);
    protected createDto = GenericDto;
    protected validationPipeOptions = {
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    };
}
