import { QueryContext } from '../models/QueryContext';
import { Result } from '../models/Result';
import { ResultArray } from '../models/ResultArray';

export interface IRepository<TEntity> {
    getById(id: string, options?: any): Promise<Result<TEntity>>;
    all(options?: any): Promise<ResultArray<TEntity>>;
    query(context: QueryContext, options?: any): Promise<ResultArray<TEntity>>;
    add(entity: TEntity, options?: any): Promise<Result<TEntity>>;
    update(entity: TEntity, options?: any): Promise<Result<TEntity>>;
    map(response: any): Promise<ResultArray<TEntity>>;
}
