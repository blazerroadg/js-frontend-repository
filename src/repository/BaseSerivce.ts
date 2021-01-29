import {IRepository} from './interfaces/IRepository';
import {IService} from './interfaces/IService';

export const baseSerivce = <
  TEntity,
  TRepository extends IRepository<TEntity>
>(repository: {
  new (): TRepository;
}): IService<TEntity> => {
  const repositoryIns = new repository();
  const service: IService<TEntity> = {
    getById: (id: string, options?: any) => {
      return repositoryIns.getById(id, options);
    },
    add: (entity: TEntity, options?: any) => {
      return repositoryIns.add(entity, options);
    },
    all: (options?: any) => {
      return repositoryIns.all(options);
    },
    update: (entity: TEntity, options?: any) => {
      return repositoryIns.update(entity, options);
    },
  };
  return service;
};
