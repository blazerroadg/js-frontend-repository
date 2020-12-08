import { QueryContext } from 'js-frontend-repository/models/QueryContext';
import { Result } from 'js-frontend-repository/models/Result';
import { ResultArray } from 'js-frontend-repository/models/ResultArray';
import { RepositoryHttpBase } from 'js-frontend-repository/RepositoryHttpBase';
import { BaseFetchParamDefualt, UpdateFetchParamDefault } from 'react-native-azure-cosmos';
import { AzureFetchEntityMetaData } from './AzureFetchEntityMetaData';

export class AzureCosmosRepository<TEntity> extends RepositoryHttpBase<TEntity> {
    metaData: AzureFetchEntityMetaData;

    constructor(entityType: new () => TEntity, metaData: AzureFetchEntityMetaData) {
      super(entityType);
      this.metaData = metaData;
    }

    async getById(id: string, options?: any): Promise<Result<TEntity>> {
      if (options?.partitionKey) throw Error('partitionKey is null or empty');
      const response = await this.metaData.networking.fetch(
        new UpdateFetchParamDefault(
          this.metaData.context.col,
          undefined,
          'ById',
                options!.partitionKey,
                `${this.metaData.context.entityType}.${id}.${options!.partitionKey}`,
                id,
                this.metaData.context.dbName,
        ),
      );
      const entity = await this.map(response);
      return this.first(entity);
    }

    async all(options?: any): Promise<ResultArray<TEntity>> {
      if (options?.partitionKey) throw Error('partitionKey is null or empty');
      const response = await this.metaData.networking.fetch(
        new BaseFetchParamDefualt(
          this.metaData.context.col,
          undefined,
          'AllCols',
                options!.partitionKey,
                `All${this.metaData.context.col}`,
                this.metaData.context.dbName,
        ),
      );
      const entities = this.map(response);
      return entities;
    }

    async query(context: QueryContext, options?: any): Promise<ResultArray<TEntity>> {
      if (options.partitionKey) throw Error('options.partitionKey is not defiend');
      if (options.actionname) throw Error('options.actionname is not defiend');

      const response = await this.metaData.networking.fetch(
        new BaseFetchParamDefualt(
          this.metaData.context.col,
          {
            query: context.query,
            parameters: context.parameters,
          },
          'Query',
          options.partitionKey,
          options.actionname,
          this.metaData.context.dbName,
        ),
      );
      const entities = this.map(response);
      return entities;
    }

    async add(entity: TEntity, options?: any): Promise<Result<TEntity>> {
      if (options.partitionKey) throw Error('options.partitionKey is null or not defiend');
      const response = await this.metaData.networking.fetch(
        new BaseFetchParamDefualt(
          this.metaData.context.col,
          entity,
          'Insert',
          options.partitionKey,
          '',
          this.metaData.context.dbName,
        ),
      );

      const result = new Result<TEntity>();
      const resData = await response.json();
      result.status = response.status;
      result.ok = response.ok;
      result.message = JSON.stringify(resData);
      return result;
    }

    async update(entity: TEntity, options?: any): Promise<Result<TEntity>> {
      if (options.partitionKey) throw Error('options.partitionKey is null or not defiend');
      if (options.id) throw Error('options.partitionKey is null or not defiend');
      const response = await this.metaData.networking.fetch(
        new UpdateFetchParamDefault(
          this.metaData.context.col,
          entity,
          'Update',
          options.partitionKey,
          '',
          options.id,
          this.metaData.context.dbName,
        ),
      );
      const mapped = await this.map(response);
      return this.first(mapped);
    }
}
