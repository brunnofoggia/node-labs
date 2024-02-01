import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseIntOrStringPipe implements PipeTransform<string, number> {
    transform(_value: string): any {
        const value = parseInt(_value, 10);
        if (isNaN(value)) {
            return _value;
        }
        return value;
    }
}
