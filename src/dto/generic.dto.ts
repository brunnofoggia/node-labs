import { IsNumber, IsOptional } from 'class-validator';
import { TimeStampDto } from './timestamp.dto';
import { Transform } from 'class-transformer';

export class GenericDto extends TimeStampDto {
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    id?: number;
}
