import { Entity } from 'typeorm';

export abstract class DynamicTmpTable {
    // change the table path on the repository after connected to a database
    static changeTablePath(datasource, tableName, newTableName) {
        const repository = datasource.getRepository(tableName);
        return {
            ...this.changeTablePathOnRepository(repository, tableName, newTableName),
            repository,
        };
    }

    // change the table path on the repository after connected to a database
    static changeTablePathOnRepository(repository, tableName, newTableName) {
        repository.metadata.tablePath = repository.metadata.tablePath.replace(tableName, newTableName);
        return { tablePath: repository.metadata.tablePath };
    }

    // build a dynamic tmp table name using a prefix and a transactionUid
    static buildDynamicTmpTableName(tableName, transactionUid) {
        return [tableName, transactionUid].join('_');
    }

    // used to create a tmp table with another name (commonly used to create a tmp table for a specific transaction)
    static decorateEntityWithNewTableName(newTableName, schema, EntityClass) {
        Entity({ name: newTableName, schema })(EntityClass);
        return {
            tableName: newTableName,
            schema,
            tablePath: [`"${schema}"`, `"${newTableName}"`].join('.'),
        };
    }

    // connect and create a dynamic tmp table
    static async connectAndSynchronizeEntity(EntityClass, fnConnection, keepConnection = false) {
        const datasource = await fnConnection({
            replaceEntities: [EntityClass],
            synchronize: true,
        });

        if (!keepConnection) await datasource.destroy();

        return datasource || null;
    }

    // connect to a database with an additional folder for dynamic entities
    // XXX: Entity must be already decorated
    static async connectAddingEntityFolder(fnConnection, additionalEntitiesFolders: string | string[]) {
        const datasource = await fnConnection({
            additionalEntitiesFolders,
        });

        return {
            datasource,
        };
    }

    // set dynamic tmp table name, decorate entity class and connect to a database making the entity synchronized
    static async createDynamicTmpTable(transactionUid, tableNamePrefix, schema, EntityClass, fnConnection, keepConnection = false) {
        const dynamicTmpTableName = DynamicTmpTable.buildDynamicTmpTableName(tableNamePrefix, transactionUid);
        DynamicTmpTable.decorateEntityWithNewTableName(dynamicTmpTableName, schema, EntityClass);

        return await DynamicTmpTable.connectAndSynchronizeEntity(EntityClass, fnConnection, keepConnection);
    }
}
