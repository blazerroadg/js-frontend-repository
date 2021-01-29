import {IRepository} from './interfaces/IRepository';
import {IResult} from './models/interfaces/IResult';
import {nullValue} from './models/nullValue';

export const repositoryBase = <TEntity>(): IRepository<TEntity> => {
  const repo: IRepository<TEntity> = {
    add: undefined,
    all: undefined,
    getById: undefined,
    query: undefined,
    update: undefined,
    innerMap: async (resData: any) => {
      const datas = resData.Documents;
      const entities = new Array<TEntity>();
      for (let index = 0; index < datas.length; index++) {
        let rowEntity: TEntity;
        for (const key in rowEntity) {
          rowEntity[key] = datas[index][key];
        }
        entities.push(rowEntity);
      }
      return entities;
    },
    first: (val: IResult<TEntity>) => {
      const result = val;
      result.entity =
        val.entities && val.entities.length > 0 ? val.entities[0] : nullValue;
      return result;
    },
    map: undefined,
  };
  return repo;
};