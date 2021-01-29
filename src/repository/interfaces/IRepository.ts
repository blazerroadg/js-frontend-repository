import {IResult} from '../models/interfaces/IResult';
import {QueryContext} from '../models/QueryContext';

export interface IRepository<TEntity> {
  getById(id: string, options?: any): Promise<IResult<TEntity>>;
  all(options?: any): Promise<IResult<TEntity>>;
  query(context: QueryContext, options?: any): Promise<IResult<TEntity>>;
  add(entity: TEntity, options?: any): Promise<IResult<TEntity>>;
  update(entity: TEntity, options?: any): Promise<IResult<TEntity>>;
  first(val: IResult<TEntity>): IResult<TEntity>;
  innerMap(resData: any): Promise<Array<TEntity>>;
  map(response: any): Promise<IResult<TEntity>>;
}
