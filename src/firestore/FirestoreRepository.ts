import { Result } from 'js-frontend-repository/models/Result';
import { ResultArray } from 'js-frontend-repository/models/ResultArray';
import { RepositoryBase } from 'js-frontend-repository/RepositoryBase';
import { cache } from 'react-native-fetch-cache/cacheResolver';
import firestore from '@react-native-firebase/firestore';
import { QueryContext } from 'js-frontend-repository/models/QueryContext';
import { FirestoreEntityMetaData } from './FirestoreEntityMetaData';

export class FirestoreRepository<TEntity> extends RepositoryBase<TEntity> {
    metaData: FirestoreEntityMetaData;

    constructor(entityType: new () => TEntity, metaData: FirestoreEntityMetaData) {
      super(entityType);
      this.metaData = metaData;
    }

    cacheResponse(): ResultArray<TEntity> {
      const result = new ResultArray<TEntity>();
      result.status = 304;
      return result;
    }

    async getById(id: string): Promise<Result<TEntity>> {
      const isCached = cache(`${this.metaData.context.collectionName}::${id}`, undefined);
      if (isCached) return this.first(this.cacheResponse());
      const fire = await firestore().collection(this.metaData.context.collectionName).doc(id).get();
      const entity = await this.map(fire);
      return this.first(entity);
    }

    async all(): Promise<ResultArray<TEntity>> {
      const isCached = cache(`${this.metaData.context.collectionName}::all`, undefined);
      if (isCached) return this.cacheResponse();
      const fire = await firestore().collection(this.metaData.context.collectionName).get();
      const entity = await this.map(fire.docs);
      return entity;
    }

    async query(context: QueryContext): Promise<ResultArray<TEntity>> {
      const query = firestore().collection(this.metaData.context.collectionName);
      context.parameters.forEach((t) => {
        const oper = t.name.split(':');
        query.where(oper[0], oper[1] as any, t.value);
      });
      const fire = await query.get();
      const entities = await this.map(fire.docs);
      return entities;
    }

    async add(entity: TEntity, options?: any): Promise<Result<TEntity>> {
      if (!options.id) throw Error('options.id is null or not defiend');
      await firestore()
        .collection(this.metaData.context.collectionName)
        .doc(options.id)
        .set(entity);
      const result = new Result<TEntity>();
      result.entity = entity;
      return result;
    }

    async update(entity: TEntity, options?: any): Promise<Result<TEntity>> {
      if (!options.id) throw Error('options.id is null or not defiend');
      await firestore()
        .collection(this.metaData.context.collectionName)
        .doc(options.id)
        .update(entity);
      const result = new Result<TEntity>();
      result.entity = entity;
      return result;
    }

    async handelMap(response: any): Promise<ResultArray<TEntity>> {
      const result = new ResultArray<TEntity>();
      if (!response) {
        result.status = response.status;
        result.ok = response.ok;
        result.message = JSON.stringify(response);
        return result;
      }
      const mapped = await this.innerMap(response);
      result.ok = true;
      result.status = 200;
      result.message = '';
      result.entity = mapped;
      return result;
    }
}
