import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class TimeStampDto {
    @IsOptional()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    readonly createdAt?: Date;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    readonly updatedAt?: Date;

    @IsOptional()
    @IsDate()
    readonly deletedAt?: Date;
}
