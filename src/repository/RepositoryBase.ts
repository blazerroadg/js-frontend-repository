import { IRepository } from "./interfaces/IRepository";
import { nullValue } from "./models/nullValue";
import { QueryContext } from "./models/QueryContext";
import { Result } from "./models/Result";
import { ResultArray } from "./models/ResultArray";

export abstract class RepositoryBase<TEntity> implements IRepository<TEntity> {

    constructor(private entityType: new () => TEntity) {
    }

    getNew(): TEntity {
        return new this.entityType();
    }

    abstract getById(id: string, options?: any): Promise<Result<TEntity>>;
    abstract all(options?: any): Promise<ResultArray<TEntity>>;
    abstract query(context: QueryContext, options?: any): Promise<ResultArray<TEntity>>;
    abstract add(entity: TEntity, options?: any): Promise<Result<TEntity>>;
    abstract update(entity: TEntity, options?: any): Promise<Result<TEntity>>;
    abstract handelMap(data: any): Promise<ResultArray<TEntity>>;

    async innerMap(resData: any): Promise<Array<TEntity>> {
        const datas = resData.Documents;
        const entities = new Array<TEntity>();
        for (let index = 0; index < datas.length; index++) {
            const rowEntity = this.getNew();
            for (const key in rowEntity) {
                rowEntity[key] = datas[index][key]
            }
            entities.push(rowEntity)
        }
        return entities;
    }
    first(val: ResultArray<TEntity>): Result<TEntity> {
        const result = new Result<TEntity>();
        result.message = val.message;
        result.ok = val.ok;
        result.status = val.status;
        result.entity = val.entity && val.entity.length > 0 ? val.entity[0] : nullValue;
        return result;
    }

    map(response: any): Promise<ResultArray<TEntity>> {
        return this.handelMap(response);
    }
}