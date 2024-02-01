import _debug from 'debug';
const debug = _debug('app:db:DynamicDatabase');

import { keys } from 'lodash';
import { QueryRunner, Repository } from 'typeorm';
import { CrudService } from './crud.service';
// import _ from 'lodash';

export class DynamicDatabase<ENTITY> extends CrudService<ENTITY> {
    protected static DatabaseConnect;
    private static dataSources: any = {};

    protected dataSource;
    protected repository: Repository<any>;

    protected poolId = 'default';
    protected databaseAlias = 'default';
    protected entity;

    constructor(poolIdOrDataSource = null) {
        super();
        this.setPoolOrDataSource(poolIdOrDataSource);
    }

    static setDatabaseConnect(DatabaseConnect) {
        DynamicDatabase.DatabaseConnect = DatabaseConnect;
    }

    static async setDataSource({ poolId = 'default', database = '', databaseDir = '', alias = '', synchronize = false }) {
        const _alias = alias || database;
        const datasourcePath = this.defineDatasourcePath(_alias, poolId);
        if (!this.getDataSource(_alias, poolId)) {
            DynamicDatabase.dataSources[datasourcePath] = await DynamicDatabase.DatabaseConnect({ database, databaseDir, synchronize });
            debug(
                'connected to database',
                `"${DynamicDatabase.dataSources[datasourcePath]?.options?.database || '?'}"`,
                'with poolId',
                datasourcePath,
            );
        }
        return DynamicDatabase.getDataSource(_alias, poolId);
    }

    static getDataSource(alias, poolId = 'default') {
        return DynamicDatabase.dataSources[DynamicDatabase.defineDatasourcePath(alias, poolId)];
    }

    static defineDatasourcePath(alias, poolId = 'default') {
        return [poolId, alias].join(':');
    }

    static listConnections() {
        return keys(DynamicDatabase.dataSources);
    }

    static async closeConnections(poolId = 'default') {
        for (const datasourcePath in DynamicDatabase.dataSources) {
            if (poolId && !datasourcePath.startsWith(poolId)) continue;

            await DynamicDatabase._closeConnection(datasourcePath);
        }
    }

    static async closeConnection(alias, poolId = 'default') {
        const datasourcePath = DynamicDatabase.defineDatasourcePath(alias, poolId);
        await DynamicDatabase._closeConnection(datasourcePath);
    }

    static async _closeConnection(datasourcePath) {
        // console.log('close this conn', datasourcePath);
        debug('closed connection', `"${DynamicDatabase.dataSources[datasourcePath]?.options?.database || '?'}"`, 'with poolId', datasourcePath);
        await DynamicDatabase.dataSources[datasourcePath]?.destroy();
        delete DynamicDatabase.dataSources[datasourcePath];
        // DynamicDatabase.dataSources = omit(DynamicDatabase.dataSources, datasourcePath);
    }

    setPoolOrDataSource(value) {
        if (typeof value === 'string') this.poolId = value;
        else if (value) this.dataSource = value;
    }

    initialize() {
        return this;
    }

    getDataSource() {
        return this.dataSource || this.setDataSource();
    }

    setDataSource() {
        if (!this.dataSource && this.databaseAlias && this.poolId) {
            this.dataSource = DynamicDatabase.getDataSource(this.databaseAlias, this.poolId);
        }
        return this.dataSource;
    }

    getRepository() {
        const repository = this.repository || this.setRepository();
        return repository;
    }

    setRepository() {
        if (!this.repository && this.entity && this.poolId) {
            const datasource = this.getDataSource();
            if (!datasource) throw new Error(`connection not found. alias: ${this.databaseAlias} , poolId: ${this.poolId}`);
            this.repository = datasource.getRepository(this.entity);
        }
        return this.repository;
    }

    async checkIfTableExists() {
        try {
            const tableName = this.getDataSource().getMetadata(this.entity).tableName;
            const hasTable = await this.getDataSource().query(
                `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`,
            );
            debug(`Table ${tableName} exists: ${hasTable[0].exists}`);
            return true;
        } catch (error) {
            debug(error);
            return false;
        }
    }

    async insertBulkData(data: Array<any>, queryRunner?: QueryRunner) {
        const result = await this.getRepository().createQueryBuilder('', queryRunner).insert().into(this.entity).values(data).execute();
        debug(`Inserted ${result?.raw?.length} rows`);
    }

    async truncate() {
        try {
            const repository = this.getRepository();
            const query = repository.createQueryBuilder().delete();
            const result = await query.execute();
            debug(`Deleted ${result.affected} rows`);
        } catch (error) {
            debug(error);
        }
    }
}
