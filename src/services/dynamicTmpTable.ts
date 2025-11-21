import { Entity, EntityOptions, getMetadataArgsStorage } from 'typeorm';

// Função auxiliar para gerar o nome da restrição
export function generateConstraintName(entityName: string, columnName: string): string {
    return `TMP_${entityName.toUpperCase()}_${columnName.toUpperCase()}`;
}

// o objetivo desse decorator é randomizar o nome da constraint da chave primária de uma tabela temporaria com nome dinamico
export function DynamicEntity(options?: EntityOptions): ClassDecorator {
    return function (target: Function) {
        // const entityName = target.name;
        Entity(options)(target);

        // Obter os metadados das colunas da entidade
        const columnMetadata: any[] = getMetadataArgsStorage().columns.filter((column) => column.target === target);

        // Encontrar a coluna de chave primária, se for única
        const primaryKeyColumns = columnMetadata.filter((column) => column?.options?.primary === true);
        if (primaryKeyColumns.length > 1) return;

        const primaryKeyColumn = primaryKeyColumns[0];
        if (primaryKeyColumn) {
            const dynamicTableName = options.name;
            const columnName = primaryKeyColumn.propertyName;
            const constraintName = options['primaryKeyConstraintName'] || generateConstraintName(dynamicTableName, columnName);

            // Atualizar o nome da constraint para a chave primária
            primaryKeyColumn.options.primaryKeyConstraintName = constraintName;
        }
    };
}

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
        DynamicEntity({ name: newTableName, schema })(EntityClass);
        return {
            tableName: newTableName,
            schema,
            tablePath: [`"${schema}"`, `"${newTableName}"`].join('.'),
        };
    }

    // connect and create a dynamic tmp table
    static async connectAndSynchronizeEntity(EntityClass, fnConnection: (options?: any) => Promise<any>, keepConnection = false) {
        const datasource = await fnConnection({
            replaceEntities: [EntityClass],
            synchronize: true,
        });

        if (!keepConnection) {
            await datasource.destroy();
            // return undefined;
        }

        return datasource;
    }

    // connect to a database with an additional folder for dynamic entities
    // XXX: Entity must be already decorated
    static async connectAddingEntityFolder(fnConnection: (options?: any) => Promise<any>, additionalEntitiesFolders: string | string[]) {
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
