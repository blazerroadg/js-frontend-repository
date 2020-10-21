import {
    BaseFetchParam,
    azurefetch,
    BaseFetchParamDefualt,
    UpdateFetchParamDefault
} from 'react-native-azure-cosmos/azurecosmos'

import { FetchParam, FetchParamDefualt, azuregermlinfetch, Param } from 'react-native-azure-cosmos-gremlin/germlin'

export interface IEntity {
    id: string;
    partitionKey: string;
    status: number;
    ok: boolean;
}

export class DefaultEntity implements IEntity {
    id: string;
    partitionKey: string;
    status: number;
    ok: boolean;
    constructor(id?: string, partitionKey?: string, status?: number, ok?: boolean) {
        this.id = id;
        this.partitionKey = partitionKey;
        this.status = status;
        this.ok = ok;
    }
}

export class QueryContext {
    partitionKey: string;
    actionname: string;
    query: string;
    parameters: Array<Param>

    constructor(query: string, parameters: Array<Param>, actionname: string, partitionKey: string) {
        this.partitionKey = partitionKey;
        this.actionname = actionname;
        this.query = query;
        this.parameters = parameters;
    }
}

export interface IRepository<TEntity extends IEntity> {
    getById(id: string, partitionKey: string): Promise<TEntity>;
    all(partitionKey: string): Promise<Array<TEntity>>;
    query(context: QueryContext): Promise<Array<TEntity>>;
    add(entity: TEntity): Promise<TEntity>;
    update(entity: TEntity): Promise<TEntity>;
    map(response: Response): Promise<Array<TEntity>>;
}

export abstract class AzureCosmosRepository<TEntity extends IEntity> implements IRepository<TEntity>
{
    metaData: AzureFetchEntityMetaData;
    constructor(metaData: AzureFetchEntityMetaData) {
        this.metaData = metaData;

    }

    async getById(id: string, partitionKey: string): Promise<TEntity> {
        const response = await this.metaData.db.fetch(
            new UpdateFetchParamDefault(
                this.metaData.col,
                undefined,
                'ById',
                partitionKey,
                `${this.metaData.entityType}.${id}.${partitionKey}`,
                id,
                this.metaData.dbName));
        const entity = await this.map(response);
        if (entity.length > 0) return entity[0];
        return null;
    }

    async all(partitionKey: string): Promise<Array<TEntity>> {
        const response = await this.metaData.db.fetch(
            new BaseFetchParamDefualt(
                this.metaData.col,
                undefined,
                'AllCols',
                partitionKey,
                `All${this.metaData.col}`,
                this.metaData.dbName));
        const entities = this.map(response);
        return entities;
    }

    async query(context: QueryContext): Promise<Array<TEntity>> {
        const response = await this.metaData.db.fetch(
            new BaseFetchParamDefualt(
                this.metaData.col,
                context.query,
                'Query',
                context.partitionKey,
                context.actionname,
                this.metaData.dbName));
        const entities = this.map(response);
        return entities;
    }
    async add(entity: TEntity): Promise<TEntity> {
        const response = await this.metaData.db.fetch(
            new BaseFetchParamDefualt(
                this.metaData.col,
                entity,
                'Insert',
                entity.partitionKey,
                "",
                this.metaData.dbName));
        const mapped = await this.map(response);
        if (mapped.length > 0) return mapped[0];
        return null;
    }
    async update(entity: TEntity): Promise<TEntity> {
        const response = await this.metaData.db.fetch(
            new UpdateFetchParamDefault(
                this.metaData.col,
                entity,
                'Update',
                entity.partitionKey,
                "",
                entity.id,
                this.metaData.dbName));
        const mapped = await this.map(response);
        if (mapped.length > 0) return mapped[0];
        return null;
    }

    async innerMap(response: Response, entity: TEntity, entities: Array<TEntity>): Promise<Array<TEntity>> {
        if (!response.ok || response.status === 304) {
            entity.status = response.status;
            entity.ok = response.ok;
            entities.push(entity);
            return entities;
        }
        var resData = await response.json();
        if (!resData || !resData.Documents || !Array.isArray(resData.Documents)) {
            entity.status = 501;
            entities.push(entity);
            return entities;
        }

        const datas = resData.Documents;
        for (let index = 0; index < datas.length; index++) {
            const rowEntity = { ...entity }
            for (const key in rowEntity) {
                rowEntity[key] = datas[index][key]
            }
            rowEntity.ok = response.ok;
            rowEntity.status = response.status;
            entities.push(rowEntity)
        }
        return entities;
    }

    abstract map(response: Response): Promise<Array<TEntity>>;

}


export abstract class AzureGermlinRepository<TEntity extends IEntity> implements IRepository<TEntity>
{
    metaData: AzureGermlinEntityMetaData;
    constructor(metaData: AzureGermlinEntityMetaData) {
        this.metaData = metaData;
    }

    async getById(id: string, partitionKey: string): Promise<TEntity> {
        const query = `g.V('${id})`
        const response = await this.metaData.db.fetch(new FetchParamDefualt(query, undefined, id));
        const entity = await this.map(response);
        if (entity.length > 0) return entity[0];
        return null;
    }

    async all(partitionKey: string): Promise<Array<TEntity>> {
        const query = `g.V().hasLabel('${this.metaData.col}')`
        const response = await this.metaData.db.fetch(
            new FetchParamDefualt(query, undefined, this.metaData.col));
        const entities = this.map(response);
        return entities;
    }

    async query(context: QueryContext): Promise<Array<TEntity>> {
        const response = await this.metaData.db.fetch(new FetchParamDefualt(context.query, context.parameters, context.actionname));
        const entities = this.map(response);
        return entities;
    }

    async add(entity: TEntity): Promise<TEntity> {
        let query = `g.addV('${this.metaData.col}')`;
        const parameters = new Array<Param>();
        for (const key in entity) {
            if (!entity[key]) return;
            const param = `@${key}`;
            parameters.push(new Param(param, String(entity[key])));
            query += `.property('${key}','${param}')`
        }
        const response = await this.metaData.db.fetch(
            new FetchParamDefualt(query, parameters, ""));
        const mapped = await this.map(response);
        if (mapped.length > 0) return mapped[0];
        return null;
    }
    async update(entity: TEntity): Promise<TEntity> {
        let query = `g.V('@id')`;
        const parameters = new Array<Param>();
        parameters.push(new Param("@id", entity.id));
        for (const key in entity) {
            if (!entity[key]) return;
            const param = `@${key}`;
            parameters.push(new Param(param, String(entity[key])));
            query += `.property('${key}','${param}')`
        }
        const response = await this.metaData.db.fetch(
            new FetchParamDefualt(query, parameters, ""));
        const mapped = await this.map(response);
        if (mapped.length > 0) return mapped[0];
        return null;
    }

    abstract map(response: Response): Promise<Array<TEntity>>;

}

export class FetchEntityMetaData<TDb extends IDb> {
    dbName: string;
    col: string;
    entityType: string;
    db: TDb
}

export class AzureFetchEntityMetaData extends FetchEntityMetaData<AzureCosmosFetch>
{
    constructor(entityType: string, col: string, dbName: string) {
        super();
        this.dbName = dbName;
        this.col = col;
        this.entityType = entityType;
        this.db = new AzureCosmosFetch();

    }
}

export class AzureGermlinEntityMetaData extends FetchEntityMetaData<AzureGermlinFetch>
{
    constructor(entityType: string, col: string, dbName: string) {
        super();
        this.dbName = dbName;
        this.col = col;
        this.entityType = entityType;
    }
}

export class FetchContext<TDb extends IDb, TMeta extends FetchEntityMetaData<TDb>> implements IFetchContext<TDb> {
    entities: Array<TMeta>;

    constructor() {
        this.entities = new Array<TMeta>();
    }

    add(entity: TMeta): void {
        this.entities.push(entity);
    }

    find<TEntity>(entity: TEntity): TMeta {
        const entityType = typeof entity;
        const res = this.entities.find(t => t.entityType === entityType);
        return res;
    }
}

export class AzureCosmosFetchContext extends FetchContext<AzureCosmosFetch, AzureFetchEntityMetaData>
{
    public static _instance: AzureCosmosFetchContext;
    public static instance(): AzureCosmosFetchContext {
        if (!AzureCosmosFetchContext._instance) {
            AzureCosmosFetchContext._instance = new AzureCosmosFetchContext();
        }
        return AzureCosmosFetchContext._instance;
    }

    private constructor() {
        super();
    }
}


export class AzureGermlinFetchContext extends FetchContext<AzureGermlinFetch, AzureGermlinEntityMetaData>
{
    public static _instance: AzureGermlinFetchContext;
    public static instance(): AzureGermlinFetchContext {
        if (!AzureGermlinFetchContext._instance) {
            AzureGermlinFetchContext._instance = new AzureGermlinFetchContext();
        }
        return AzureGermlinFetchContext._instance;
    }

    private constructor() {
        super();
    }
}

export interface IDb {
}

export class AzureCosmosFetch implements IDb {
    fetch(param: BaseFetchParam): Promise<Response> {
        return azurefetch(param);
    }
}

export class AzureGermlinFetch implements IDb {
    fetch(param: FetchParam): Promise<Response> {
        return azuregermlinfetch(param);
    }
}


export interface IFetchContext<TDb extends IDb> {
    entities: Array<FetchEntityMetaData<TDb>>
}

export interface IService<TEntity extends IEntity> {
    getById(id: string, partitionKey: string): Promise<TEntity>;
    all(partitionKey: string): Promise<Array<TEntity>>;
    query(context: QueryContext): Promise<Array<TEntity>>;
    add(entity: TEntity): Promise<TEntity>;
    update(entity: TEntity): Promise<TEntity>;
}

export class BaseSerivce<TEntity extends IEntity, TRepository extends IRepository<TEntity>> implements IService<TEntity>
{
    repository: TRepository
    constructor(repository: TRepository) {
        this.repository = repository;
    }

    getById(id: string, partitionKey: string): Promise<TEntity> {
        return this.repository.getById(id, partitionKey);
    }
    all(partitionKey: string): Promise<Array<TEntity>> {
        return this.repository.all(partitionKey);
    }
    query(context: QueryContext): Promise<Array<TEntity>> {
        return this.repository.query(context);
    }
    add(entity: TEntity): Promise<TEntity> {
        return this.repository.add(entity);
    }
    update(entity: TEntity): Promise<TEntity> {
        return this.repository.update(entity);
    }

}


export interface IReduxService<TEntity extends IEntity> {
    getById(actionName: string, id: string, partitionKey: string): Promise<void>;
    all(actionName: string, partitionKey: string): Promise<void>;
    query(actionName: string, context: QueryContext): Promise<void>;
    add(entity: TEntity): Promise<void>;
    update(entity: TEntity): Promise<void>;
    dispatch(actionName: string, entity: TEntity): void
}

export class BaseReduxService<TEntity extends IEntity, TRepository extends IRepository<TEntity>> implements IReduxService<TEntity>
{
    repository: TRepository;
    reduxDispatch: any;

    constructor(dispatch: any, repository: TRepository) {
        this.repository = repository;
        this.reduxDispatch = dispatch;
    }


    dispatch(actionName: string, entity: TEntity | TEntity[]): void {
        const ent = Array.isArray(entity) ? entity[0] : (entity as TEntity);
        if (ent.status === 304)
            return;
        if (!ent.ok) {
            throw new Error("There is some thing wrong from API");
        }
        this.reduxDispatch({ type: actionName, entity: entity })
    }


    async  getById(actionName: string, id: string, partitionKey: string): Promise<void> {
        const response = await this.repository.getById(id, partitionKey);
        this.dispatch(actionName, response);

    }
    async all(actionName: string, partitionKey: string): Promise<void> {
        const response = await this.repository.all(partitionKey);
        this.dispatch(actionName, response);

    }
    async  query(actionName: string, context: QueryContext): Promise<void> {
        const response = await this.repository.query(context);
        this.dispatch(actionName, response);
    }
    async  add(entity: TEntity): Promise<void> {
        await this.repository.add(entity);
    }
    async  update(entity: TEntity): Promise<void> {
        await this.repository.update(entity);
    }
}


export interface IReducerSerice<TState> {
    state: TState
    acceptableActions: Array<string>

    isAcceptable(actionName: string): boolean;
    reduce(state: TState, action: any): TState;
}

export class DefualtReducerService<TState> implements IReducerSerice<TState> {

    state: TState
    acceptableActions: Array<string>

    constructor(state: TState) {
        this.state = state;
        this.acceptableActions = new Array<string>();
        this.fillAcceptable(state);
    }

    fillAcceptable(state: TState) {
        for (const key in state) {
            this.acceptableActions.push(key)
        }
    }

    isAcceptable(actionName: string): boolean {
        return this.acceptableActions.some(t => t === actionName);
    }

    reduce(state: TState = this.state, action: any): TState {
        if (!action || !this.isAcceptable(action.type)) return state;
        return { ...state, [action.type]: action.entity }
    }

}