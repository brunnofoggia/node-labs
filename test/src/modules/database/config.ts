import { DataSourceOptions } from 'typeorm';

const testDatabaseConfig = () => {
    return {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        dropSchema: true,
        entities: [
            'src/**/*.entity.ts',
            'test/src/**/*.entity.ts',
        ],
    } as DataSourceOptions;
};

export const DatabaseOptions = async (options: any = {}) => {
    return testDatabaseConfig();
};
