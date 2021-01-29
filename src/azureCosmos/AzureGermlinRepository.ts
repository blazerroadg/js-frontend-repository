import {AzureGermlinEntityMetaData} from './AzureGermlinEntityMetaData';
import {
  repositoryHttpBase,
  IRepositoryHttp,
} from '../repository/repositoryHttpBase';

const azureGermlinRepository = <TEntity>(): IRepositoryHttp<TEntity> => {
  const repo: IRepositoryHttp<TEntity> = {
    ...repositoryHttpBase(),
  };
  return repo;
};

export class AzureGermlaaainRepository<
  TEntity
> extends RepositoryHttpBase<TEntity> {
  metaData: AzureGermlinEntityMetaData;

  constructor(
    entityType: new () => TEntity,
    metaData: AzureGermlinEntityMetaData,
  ) {
    super(entityType);
    this.metaData = metaData;
  }

  async getById(id: string, options?: any): Promise<Result<TEntity>> {
    const query = `g.V('${id})`;
    const response = await this.metaData.networking.fetch(
      new FetchParamDefualt(query, nullValue, id, options?.auth),
    );
    const mapped = await this.map(response);
    return this.first(mapped);
  }

  async all(options?: any): Promise<ResultArray<TEntity>> {
    const query = `g.V().hasLabel('${this.metaData.context.col}')`;
    const response = await this.metaData.networking.fetch(
      new FetchParamDefualt(
        query,
        undefined as any,
        this.metaData.context.col,
        options?.auth,
      ),
    );
    const entities = this.map(response);
    return entities;
  }

  async query(
    context: QueryContext,
    options?: any,
  ): Promise<ResultArray<TEntity>> {
    if (options.actionname) throw Error('options.actionname is not defiend');
    const response = await this.metaData.networking.fetch(
      new FetchParamDefualt(
        context.query,
        context.parameters,
        options?.actionname,
        options?.auth,
      ),
    );
    const entities = this.map(response);
    return entities;
  }

  async add(entity: TEntity, options?: any): Promise<Result<TEntity>> {
    let query = `g.addV('${this.metaData.context.col}')`;
    const parameters = new Array<Param>();
    Object.keys(entity).forEach((key) => {
      if (!entity[key]) return;
      const param = `@${key}`;
      parameters.push(new Param(param, String(entity[key])));
      query += `.property('${key}','${param}')`;
    });
    const response = await this.metaData.networking.fetch(
      new FetchParamDefualt(query, parameters, '', options?.auth),
    );
    const mapped = await this.map(response);
    return this.first(mapped);
  }

  async update(entity: TEntity, options?: any): Promise<Result<TEntity>> {
    if (options.id) throw Error('options.partitionKey is null or not defiend');
    let query = "g.V('@id')";
    const parameters = new Array<Param>();
    parameters.push(new Param('@id', options.id));
    Object.keys(entity).forEach((key) => {
      if (!entity[key]) return;
      const param = `@${key}`;
      parameters.push(new Param(param, String(entity[key])));
      query += `.property('${key}','${param}')`;
    });

    const response = await this.metaData.networking.fetch(
      new FetchParamDefualt(query, parameters, '', options?.auth),
    );
    const mapped = await this.map(response);
    return this.first(mapped);
  }

  async handelMap(response: Response): Promise<any> {
    const result = new ResultArray<TEntity>();
    const resData = await response.json();
    if (!response || !resData) {
      result.status = response.status;
      result.ok = response.ok;
      result.message = JSON.stringify(resData);
      return result;
    }

    if (!resData || !resData.result || !Array.isArray(resData.result)) {
      result.status = 501;
      return result;
    }
    return this.innerMap(resData);
  }
}
