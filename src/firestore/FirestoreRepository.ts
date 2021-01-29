import {cache} from 'react-native-fetch-cache/cacheResolver';
import firestore from '@react-native-firebase/firestore';
import {IResult} from 'js-frontend-repository/models/interfaces/IResult';
import {nullValue} from '@/constans';
import {IRepository} from 'js-frontend-repository/interfaces/IRepository';
import {repositoryBase} from 'js-frontend-repository/repositoryBase';
import QueryContext from 'js-frontend-repository/models/QueryContext';

export const firestoreRepository = <TEntity>(
  col: string,
): IRepository<TEntity> => {
  const cacheResponse = <TEntity>(): IResult<TEntity> => {
    const result: IResult<TEntity> = {
      status: 304,
      entity: nullValue,
      entities: nullValue,
      message: nullValue,
      ok: true,
    };
    return result;
  };
  const repo: IRepository<TEntity> = {
    ...repositoryBase(),
    getById: async (id: string) => {
      const isCached = cache(`${col}::${id}`, undefined);
      if (isCached) return repo.first(cacheResponse());
      const fire = await firestore().collection(col).doc(id).get();
      const entity = await repo.map(fire);
      return repo.first(entity);
    },
    all: async () => {
      const isCached = cache(`${col}::all`, undefined);
      if (isCached) return cacheResponse();
      const fire = await firestore().collection(col).get();
      const entity = await repo.map(fire.docs);
      return entity;
    },
    query: async (context: QueryContext) => {
      const query = firestore().collection(col);
      context.parameters.forEach((t) => {
        const oper = t.name.split(':');
        query.where(oper[0], oper[1] as any, t.value);
      });
      const fire = await query.get();
      const entities = await repo.map(fire.docs);
      return entities;
    },
    add: async (entity: TEntity, options?: any) => {
      if (!options.id) throw Error('options.id is null or not defiend');
      await firestore().collection(col).doc(options.id).set(entity);
      const result: IResult<TEntity> = {
        entity: entity,
        message: 'entity added',
        ok: true,
        status: 200,
      };
      return result;
    },
    update: async (entity: TEntity, options?: any) => {
      if (!options.id) throw Error('options.id is null or not defiend');
      await firestore().collection(col).doc(options.id).update(entity);
      const result: IResult<TEntity> = {
        entity: entity,
        message: 'entity updated',
        ok: true,
        status: 200,
      };
      return result;
    },
    map: async (response: any) => {
      if (!response) {
        const notResult: IResult<TEntity> = {
          status: response.status,
          ok: response.ok,
          message: JSON.stringify(response),
          entity: nullValue,
          entities: nullValue,
        };
        return notResult;
      }
      const mapped: Array<TEntity> = JSON.parse(response);
      const result: IResult<TEntity> = {
        status: 200,
        ok: true,
        message: 'OK',
        entities: mapped,
        entity: nullValue,
      };
      return result;
    },
  };
  return repo;
};
