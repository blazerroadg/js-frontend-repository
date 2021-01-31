import {IRepository} from 'js-frontend-repository/interfaces/IRepository';
import {IResult} from 'js-frontend-repository/models/interfaces/IResult';
import {IReduxService} from './IReduxService';

export const baseReduxService = <
  TEntity,
  TRepository extends IRepository<TEntity>
>(
  RepositoryType: new () => TRepository,
  dispatch: any,
): IReduxService<TEntity> => {
  const repository = new RepositoryType();
  const service: IReduxService<TEntity> = {
    dispatch: (actionName: string, result: IResult<TEntity>): void => {
      if (result.status === 304) return;
      if (!result.ok) {
        throw new Error('There is some thing wrong from API');
      }
      dispatch({type: actionName, entity: result.entity});
    },
    getById: async (
      actionName: string,
      id: string,
      options?: any,
    ): Promise<void> => {
      const response = await repository.getById(id, options);
      dispatch(actionName, response);
    },
    all: async (actionName: string, options?: any): Promise<void> => {
      const response = await repository.all(options);
      dispatch(actionName, response);
    },
    add: async (entity: TEntity, options?: any): Promise<void> => {
      await repository.add(entity, options);
    },
    update: async (entity: TEntity, options?: any): Promise<void> => {
      await repository.update(entity, options);
    },
  };
  return service;
};
