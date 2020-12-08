import { IRepository } from 'js-frontend-repository/interfaces/IRepository';
import { IResult } from 'js-frontend-repository/models/interfaces/IResult';
import { IReduxService } from './IReduxService';

/* eslint indent: "off" */
export class BaseReduxService<TEntity, TRepository extends IRepository<TEntity>>
implements IReduxService<TEntity> {
    repository: TRepository;

    reduxDispatch: any;

    constructor(private RepositoryType: new () => TRepository, dispatch: any) {
      this.repository = new this.RepositoryType();
      this.reduxDispatch = dispatch;
    }

    dispatch(actionName: string, result: IResult<TEntity>): void {
      if (result.status === 304) return;
      if (!result.ok) {
        throw new Error('There is some thing wrong from API');
      }
      this.reduxDispatch({ type: actionName, entity: result.entity });
    }

    async getById(actionName: string, id: string, options?: any): Promise<void> {
      const response = await this.repository.getById(id, options);
      this.dispatch(actionName, response);
    }

    async all(actionName: string, options?: any): Promise<void> {
      const response = await this.repository.all(options);
      this.dispatch(actionName, response);
    }

    async add(entity: TEntity, options?: any): Promise<void> {
      await this.repository.add(entity, options);
    }

    async update(entity: TEntity, options?: any): Promise<void> {
      await this.repository.update(entity, options);
    }
}
