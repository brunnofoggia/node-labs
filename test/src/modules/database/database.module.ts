import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseOptions } from './config';

export const DatabaseModule = (options: any = {}) => TypeOrmModule.forRootAsync(
    { name: options.dataSourceName || options.databaseDir || 'default', useFactory: async () => await DatabaseOptions(options), }
);
