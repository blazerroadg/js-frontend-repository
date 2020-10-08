import { BaseFetchParam, azurefetch, SpFetchParam, UpdateFetchParam, BaseFetchParamDefualt, SpFetchParamDefault, UpdateFetchParamDefault } from 'react-native-azure-cosmos/azurecosmos'
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

export class BaseReduxParam {
    dispatch: any;
    state: any;
    constructor(dispatch: any, state: any) {
        this.dispatch = dispatch;
        this.state = state;
    }
}


export class BaseFetchReduxService<TRequest extends BaseFetchParam, TRepository extends IRepository<TRequest>> extends BaseSerivce<TRequest, TRepository>
{
    constructor(repository: TRepository) {
        super(repository);
    }
    async  rfetch(param: TRequest, reduxParam: BaseReduxParam): Promise<any> {
        try {
            const response = await super.fetch(param);
            if (response.status === 304) {
                return;
            }
            if (!response.ok) {
                throw new Error("There is some thing wrong from API");
            }
            const resData = await response.json();
            reduxParam.dispatch({ type: param.actionName, data: resData })
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}



export class DefaultAzureFetchService extends BaseFetchReduxService<BaseFetchParam, AzurefetchRepository>
{
    constructor() {
        super(new AzurefetchRepository());

    }
}

export class DefaultAzureFetchSpService extends BaseFetchReduxService<SpFetchParam, AzurefetchRepository>
{
    constructor() {
        super(new AzurefetchRepository());
    }
}

export class DefaultAzureFetchUpdateService extends BaseFetchReduxService<UpdateFetchParam, AzurefetchRepository>
{
    constructor() {
        super(new AzurefetchRepository());
    }
}

export class DefaultAzureGermlinFetchService extends BaseSerivce<FetchParam, AzureGermlinfetchRepository>
{
    constructor() {
        super(new AzureGermlinfetchRepository());
    }
    async  rfetch(param: FetchParam, reduxParam: BaseReduxParam): Promise<any> {
        try {
            const response = await super.fetch(param);
            if (response.status === 304) {
                return ;
            }
            if (!response.ok) {
                throw new Error("There is some thing wrong from API");
            }
            const resData = await response.json();
            reduxParam.dispatch({ type: param.actionName, data: resData })
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

const testFunc = () => {
   
}

