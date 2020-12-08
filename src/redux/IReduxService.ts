import { IResult } from 'js-frontend-repository/models/interfaces/IResult';

export interface IReduxService<TEntity> {
    getById(actionName: string, id: string, options?: any): Promise<void>;
    all(actionName: string, options?: any): Promise<void>;
    add(entity: TEntity, options?: any): Promise<void>;
    update(entity: TEntity, options?: any): Promise<void>;
    dispatch(actionName: string, result: IResult<TEntity>): void
}
