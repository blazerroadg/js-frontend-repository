import { BaseFetchParam, azurefetch } from 'react-native-azure-cosmos/azurecosmos'
import { FetchParam, azuregermlinfetch } from 'react-native-azure-cosmos-gremlin/germlin'

export interface IRepository<TRequest> {
    fetch(param: TRequest): Promise<any>
}

export class AzurefetchRepository implements IRepository<BaseFetchParam>
{
    fetch(param: BaseFetchParam): Promise<any> {
        return azurefetch(param);
    }
}

export class AzureGermlinfetchRepository implements IRepository<FetchParam>
{
    fetch(param: FetchParam): Promise<any> {
        return azuregermlinfetch(param);
    }
}


export interface IService<TRequest> {
    fetch(param: TRequest): Promise<any>
}

export class BaseSerivce<TRequest, TRepository extends IRepository<TRequest>> implements IService<TRequest>
{
    repository: TRepository
    constructor(repository: TRepository) {
        this.repository = repository;
    }

    fetch(param: TRequest): Promise<any> {
        return this.repository.fetch(param);
    }
}

