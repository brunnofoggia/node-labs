import { Controller, Body, Param, ValidationPipe, HttpException, HttpStatus, Query } from '@nestjs/common';
import { IdInterface } from '../interfaces/id.interface';
import { ParseIntOrStringPipe } from '../pipes/parseIntOrString.pipe';

@Controller()
export class CrudController<ResponseInterface, CreateDto, UpdateDto> {
    protected service;
    protected createDto;
    protected updateDto;
    protected validationPipeOptions = {
        transform: true,
        whitelist: true,
    };

    async _validationPipe(item, dto) {
        if (typeof dto === 'undefined') throw new HttpException('dto property undefined at controller', HttpStatus.INTERNAL_SERVER_ERROR);
        const validationPipe = new ValidationPipe({
            ...this.validationPipeOptions,
            expectedType: dto
        });
        return await validationPipe.transform(item, dto);
    }

    // @Post()
    async _create(@Body() item: CreateDto, @Query() query: any): Promise<IdInterface | ResponseInterface> {
        const dto: CreateDto = await this._validationPipe(item, this.createDto);
        return await this.service().create(dto, query);
    }

    // @Get('/count/rows')
    async _count(): Promise<number> {
        return await this.service().count();
    }

    // @Get()
    async _find(): Promise<ResponseInterface[]> {
        return await this.service().find();
    }

    // @Get(':id')
    // @UseInterceptors(new NullResponseInterceptor())
    async _findById(@Param('id', ParseIntOrStringPipe) id: number | string): Promise<ResponseInterface> {
        const item = await this.service().findById(id);
        return item;
    }

    // @Put(':id')
    async _update(@Param('id', ParseIntOrStringPipe) id: number | string, @Body() item: UpdateDto): Promise<IdInterface> {
        item[this.service().getIdAttribute()] = id;
        const dto: UpdateDto = await this._validationPipe(item, this.updateDto || this.createDto);
        return this.service().update(dto);
    }

    // @Put()
    async _replace(@Body() item: UpdateDto): Promise<IdInterface> {
        const dto: UpdateDto = await this._validationPipe(item, this.updateDto || this.createDto);
        return this.service().replace(dto);
    }

    // @Delete(':id')
    async _remove(@Param('id', ParseIntOrStringPipe) id: number | string): Promise<IdInterface> {
        return await this.service().remove(id);
    }
}
