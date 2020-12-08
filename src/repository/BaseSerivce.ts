import { IRepository } from "./interfaces/IRepository";
import { IService } from "./interfaces/IService";
import { Result } from "./models/Result";
import { ResultArray } from "./models/ResultArray";

export class BaseService<TEntity, TRepository extends IRepository<TEntity>> implements IService<TEntity> {
    repository: TRepository
    constructor(private repositoryType: new () => TRepository,) {
        this.repository = new this.repositoryType();
    }

    getById(id: string, options?: any): Promise<Result<TEntity>> {
        return this.repository.getById(id, options);
    }
    all(options?: any): Promise<ResultArray<TEntity>> {
        return this.repository.all(options);
    }
    add(entity: TEntity, options?: any): Promise<Result<TEntity>> {
        return this.repository.add(entity, options);
    }
    update(entity: TEntity, options?: any): Promise<Result<TEntity>> {
        return this.repository.update(entity, options);
    }

}
