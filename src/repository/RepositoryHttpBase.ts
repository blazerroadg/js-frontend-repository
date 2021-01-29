import {IRepository} from './interfaces/IRepository';
import {IResult} from './models/interfaces/IResult';
import {repositoryBase} from './repositoryBase';
export interface IRepositoryHttp<TEntity> extends IRepository<TEntity> {
  handelMap(response: Response): Promise<IResult<TEntity>>;
}

export const repositoryHttpBase = <TEntity>(): IRepositoryHttp<TEntity> => {
  const repo: IRepositoryHttp<TEntity> = {
    ...repositoryBase(),
    handelMap: async (response: Response) => {
      let result : IResult<TEntity> ;
      let entities = new Array<TEntity>();
      const resData = await response.json();
      if (!response.ok || response.status === 304) {
        result.status = response.status;
        result.ok = response.ok;
        result.message = JSON.stringify(resData);
        return result;
      }
      if (!resData || !resData.Documents || !Array.isArray(resData.Documents)) {
        result.ok = false;
        result.status = 501;
        result.message = JSON.stringify(resData);
        return result;
      }

      entities = await repo.innerMap(resData);
      result.ok = true;
      result.status = 200;
      result.message = '';
      result.entities = entities;
      return result;
    },
  };
  return repo;
};