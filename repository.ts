
import {
    BaseFetchParam,
    azurefetch,
    BaseFetchParamDefualt,
    UpdateFetchParamDefault,
    initAzureCosmos,
    AzureConfig
} from 'react-native-azure-cosmos/azurecosmos'
import { cache } from 'react-native-fetch-cache/cacheResolver'


import firestore from '@react-native-firebase/firestore';

import { FetchParam, FetchParamDefualt, azuregermlinfetch, Param, GermlinConfig, initCosmosGermlin } from 'react-native-azure-cosmos-gremlin/germlin'
export class ParamType extends Param {

}
export interface IEntity {
    id: string;
    partitionKey: string;
    status: number;
    ok: boolean;
    message?: string;
}

export class DefaultEntity implements IEntity {
    id: string;
    partitionKey: string;
    status: number;
    ok: boolean;
    error?: string;
    constructor(id?: string, partitionKey?: string, status?: number, ok?: boolean) {
        this.id = id ?? "";
        this.partitionKey = partitionKey ?? "";
        this.status = status ?? 0;
        this.ok = ok ?? true;
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

export const nullValue = null as any;
export class FirestoreRepository<TEntity extends IEntity> implements IRepository<TEntity>
{
    metaData: FirestoreEntityMetaData;
    constructor(private entityType: new () => TEntity, metaData: FirestoreEntityMetaData) {
        this.metaData = metaData;

    }

    getNew(): TEntity {
        return new this.entityType();
    }

    cacheResponse(): TEntity {
        let entity = this.getNew();
        entity.ok = true;
        entity.status = 304;
        return entity;
    }

    async getById(id: string, partitionKey: string): Promise<TEntity> {
        const isCached = cache(`${this.metaData.col}::${id}`, undefined);
        if (isCached) return this.cacheResponse();
        const fire = await firestore().collection(this.metaData.col).doc(id).get();
        const entity = await this.map(new Response(fire));
        if (entity.length > 0) return entity[0];
        return nullValue;
    }

    async all(partitionKey: string): Promise<Array<TEntity>> {
        const isCached = cache(`${this.metaData.col}::all`, undefined);
        if (isCached) return [this.cacheResponse()];
        const fire = await firestore().collection(this.metaData.col).get();
        const entity = await this.map(new Response(fire.docs));
        return entity;
    }

    async query(context: QueryContext): Promise<Array<TEntity>> {
        let query = firestore().collection(this.metaData.col);
        context.parameters.forEach(t => {
            const oper = t.name.split(":");
            query.where(oper[0], oper[1] as any, t.value)
        })
        const fire = await query.get();
        const entities = await this.map(new Response(fire.docs));
        return entities;

    }
    async add(entity: TEntity): Promise<TEntity> {
        await firestore()
            .collection(this.metaData.col)
            .doc(entity.id)
            .set(entity);

        return entity;
    }
    async update(entity: TEntity): Promise<TEntity> {
        await firestore()
            .collection(this.metaData.col)
            .doc(entity.id)
            .update(entity)
        return entity;

    }

    async handelMap(data: any): Promise<Array<TEntity>> {
        let entity = this.getNew();
        let entities = new Array<TEntity>();
        if (!data._bodyInit) {
            entity.status = 501;
            entity.ok = false;
            entities.push(entity);
            return entities;
        }

        if (!data._bodyInit._exists) {
            entity.status = 404;
            entity.ok = true;
            entities.push(entity);
            return entities;
        }

        const resData = Array.isArray(data._bodyInit) ? data._bodyInit : [data._bodyInit];
        return this.innerMap(resData);
    }

    async innerMap(resData: any): Promise<Array<TEntity>> {
        const entities = new Array<TEntity>();
        for (let index = 0; index < resData.length; index++) {
            const rowEntity = this.getNew();
            for (const key in rowEntity) {
                rowEntity[key] = resData[index]._data[key]
            }
            rowEntity.ok = true;
            rowEntity.status = 200;
            entities.push(rowEntity)
        }
        return entities;
    }

    map(response: Response): Promise<Array<TEntity>> {
        return this.handelMap(response);
    }

}


export class AzureCosmosRepository<TEntity extends IEntity> implements IRepository<TEntity>
{
    metaData: AzureFetchEntityMetaData;
    constructor(private entityType: new () => TEntity, metaData: AzureFetchEntityMetaData) {
        this.metaData = metaData;

    }

    getNew(): TEntity {
        return new this.entityType();
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
        return nullValue;
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
                {
                    "query": context.query,
                    "parameters": context.parameters
                },
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

        let entityResp = this.getNew();

        const resData = await response.json();
        entityResp.status = response.status;
        entityResp.ok = response.ok;
        entityResp.message = JSON.stringify(resData)
        return entityResp;
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
        return nullValue;
    }

    async handelMap(response: Response): Promise<Array<TEntity>> {
        let entity = this.getNew();
        let entities = new Array<TEntity>();
        const resData = await response.json();
        if (!response.ok || response.status === 304) {
            entity.status = response.status;
            entity.ok = response.ok;
            entity.message = JSON.stringify(resData)
            entities.push(entity);
            return entities;
        }
        if (!resData || !resData.Documents || !Array.isArray(resData.Documents)) {
            entity.status = 501;
            entity.message = JSON.stringify(resData)
            entities.push(entity);
            return entities;
        }

        return this.innerMap(resData);
    }

    async innerMap(resData: any): Promise<Array<TEntity>> {
        const datas = resData.Documents;
        const entities = new Array<TEntity>();
        for (let index = 0; index < datas.length; index++) {
            const rowEntity = this.getNew();
            for (const key in rowEntity) {
                rowEntity[key] = datas[index][key]
            }
            rowEntity.ok = true;
            rowEntity.status = 200;
            entities.push(rowEntity)
        }
        return entities;
    }

    map(response: Response): Promise<Array<TEntity>> {
        return this.handelMap(response);
    }

}


export class AzureGermlinRepository<TEntity extends IEntity> implements IRepository<TEntity> {
    metaData: AzureGermlinEntityMetaData;
    constructor(private entityType: new () => TEntity, metaData: AzureGermlinEntityMetaData) {
        this.metaData = metaData;
    }

    getNew(): TEntity {
        return new this.entityType();
    }

    async getById(id: string, partitionKey: string): Promise<TEntity> {
        const query = `g.V('${id})`
        const response = await this.metaData.db.fetch(new FetchParamDefualt(query, nullValue, id));
        const entity = await this.map(response);
        if (entity.length > 0) return entity[0];
        return nullValue;
    }

    async all(partitionKey: string): Promise<Array<TEntity>> {
        const query = `g.V().hasLabel('${this.metaData.col}')`
        const response = await this.metaData.db.fetch(
            new FetchParamDefualt(query, undefined as any, this.metaData.col));
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
            if (!entity[key]) return nullValue;
            const param = `@${key}`;
            parameters.push(new Param(param, String(entity[key])));
            query += `.property('${key}','${param}')`
        }
        const response = await this.metaData.db.fetch(
            new FetchParamDefualt(query, parameters, ""));
        const mapped = await this.map(response);
        if (mapped.length > 0) return mapped[0];
        return nullValue;
    }
    async update(entity: TEntity): Promise<TEntity> {
        let query = `g.V('@id')`;
        const parameters = new Array<Param>();
        parameters.push(new Param("@id", entity.id));
        for (const key in entity) {
            if (!entity[key]) continue;
            const param = `@${key}`;
            parameters.push(new Param(param, String(entity[key])));
            query += `.property('${key}','${param}')`
        }
        const response = await this.metaData.db.fetch(
            new FetchParamDefualt(query, parameters, ""));
        const mapped = await this.map(response);
        if (mapped.length > 0) return mapped[0];
        return nullValue;
    }


    async handelMap(response: Response): Promise<any> {
        let entity = this.getNew();
        let entities = new Array<TEntity>();
        if (!response.ok || response.status === 304) {
            entity.status = response.status;
            entity.ok = response.ok;
            entities.push(entity);
            return entities;
        }
        const resData = await response.json();
        if (!resData || !resData.result || !Array.isArray(resData.result)) {
            entity.status = 501;
            entities.push(entity);
            return entities;
        }
        return this.innerMap(resData);
    }

    async innerMap(resData: any): Promise<Array<TEntity>> {
        let entities = new Array<TEntity>();
        const datas = resData.result;
        for (let index = 0; index < datas.length; index++) {
            const rowEntity = this.getNew();
            for (const key in rowEntity) {
                rowEntity[key] = datas[index][key]
            }
            rowEntity.ok = true;
            rowEntity.status = 200;
            entities.push(rowEntity)
        }
        return entities;
    }

    map(response: Response): Promise<Array<TEntity>> {
        return this.handelMap(response);
    }

}


export class FetchEntityMetaData<TDb extends IDb> {
    dbName: string = "";
    col: string = "";
    entityType: string = "";
    db: TDb = nullValue
}

class NullDb implements IDb {

}

export class FirestoreEntityMetaData extends FetchEntityMetaData<NullDb>
{
    constructor(entityType: string, col: string, dbName: string) {
        super();
        this.dbName = dbName;
        this.col = col;
        this.entityType = entityType;
        this.db = nullValue;

    }
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
        this.db = new AzureGermlinFetch()
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

export class BaseReduxService<TEntity extends IEntity> implements IReduxService<TEntity>
{
    repository: IRepository<TEntity>;
    reduxDispatch: any;

    constructor(dispatch: any, repository: IRepository<TEntity>) {
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


    async getById(actionName: string, id: string, partitionKey: string): Promise<void> {
        const response = await this.repository.getById(id, partitionKey);
        this.dispatch(actionName, response);

    }
    async all(actionName: string, partitionKey: string): Promise<void> {
        const response = await this.repository.all(partitionKey);
        this.dispatch(actionName, response);

    }
    async query(actionName: string, context: QueryContext): Promise<void> {
        const response = await this.repository.query(context);
        this.dispatch(actionName, response);
    }
    async add(entity: TEntity): Promise<void> {
        await this.repository.add(entity);
    }
    async update(entity: TEntity): Promise<void> {
        await this.repository.update(entity);
    }
}

export interface IReducer<TState> {
    state: TState;
    acceptableActions: Array<string>;
    reduce(state: TState, action: any): TState
}

export abstract class BaseReducer<TState> implements IReducer<TState> {
    state: TState;
    acceptableActions: Array<string>;
    protected successor: BaseReducer<TState> = nullValue;


    constructor(state: TState, acceptableActions: Array<string>) {
        this.state = state;
        this.acceptableActions = acceptableActions;
    }

    isAcceptable(actionName: string): boolean {
        return this.acceptableActions.some(t => t === actionName);
    }

    public setSuccessor(successor: BaseReducer<TState>): void {
        this.successor = successor;
    }

    public handleRequest(state: TState, action: any): TState {
        if (this.isAcceptable(action.type)) {
            return this.reduce(state, action)
        }
        if (this.successor) {
            return this.successor.handleRequest(state, action)
        }
        return state;
    }

    abstract reduce(state: TState, action: any): TState
}

export class DefaultReducer<TState> extends BaseReducer<TState>
{
    constructor(state: TState) {
        super(state, new Array<string>())
        this.fillAcceptable(state);
    }

    fillAcceptable(state: TState) {
        for (const key in state) {
            this.acceptableActions.push(key);
        }
    }

    reduce(state: TState, action: any): TState {
        return { ...state, [action.type]: action.entity }
    }
}



export class DefualtReducerService<TState> {

    state: TState;
    reducers: Array<BaseReducer<TState>>;
    reducer: BaseReducer<TState> = nullValue;

    constructor(state: TState, reducers: Array<BaseReducer<TState>>) {
        this.state = state;
        this.reducers = reducers;
        this.chain();

    }

    pairwise(arr: Array<BaseReducer<TState>>, func: any) {
        for (var i = 0; i < arr.length; i++) {
            if (i === arr.length) {
                arr[i].setSuccessor(new DefaultReducer<TState>(this.state))
                return;
            }
            func(arr[i], arr[i + 1])
        }
    }


    chain(): void {
        const defaultSuccessor = new DefaultReducer<TState>(this.state);
        if (this.reducers && this.reducers.length > 0) {
            this.pairwise(this.reducers, function (current: BaseReducer<TState>, next: BaseReducer<TState>) {
                const succeror = next ? next : defaultSuccessor
                current.setSuccessor(succeror);
            })
            this.reducer = this.reducers[0]
            return;
        }
        this.reducer = defaultSuccessor

    }

    reduce(state: TState = this.state, action: any): TState {
        return this.reducer.handleRequest(state, action);
    }

}



export const initGermlin = (config: GermlinConfig) => {
    initCosmosGermlin(config)
}

export const initCosmos = (config: AzureConfig) => {
    initAzureCosmos(config)
}
