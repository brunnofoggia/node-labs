import _debug from 'debug';
const debug = _debug('app:ExceptionInterceptor');

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    BadGatewayException,
    CallHandler,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(
                catchError(_err => {
                    let err;
                    console.log('exception', _err);
                    switch (true) {
                        case _err instanceof HttpException:
                            debug('http:', _err);
                            err = throwError(() => _err);
                            break;
                        case _err instanceof QueryFailedError:
                            debug('query:', _err);
                            err = throwError(() => new HttpException(_err['code'] + '', HttpStatus.UNPROCESSABLE_ENTITY));
                            break;
                        default:
                            debug('unknown:', _err);
                            err = throwError(() => new BadGatewayException());
                    }

                    return err;
                }),
            );
    }
}
