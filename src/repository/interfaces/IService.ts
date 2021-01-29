import {IResult} from '../models/interfaces/IResult';

export interface IService<TEntity> {
  getById(id: string, options?: any): Promise<IResult<TEntity>>;
  all(options?: any): Promise<IResult<TEntity>>;
  add(entity: TEntity, options?: any): Promise<IResult<TEntity>>;
  update(entity: TEntity, options?: any): Promise<IResult<TEntity>>;
}
