import { ResultArray } from "./models/ResultArray";
import { RepositoryBase } from "./RepositoryBase";

export abstract class RepositoryHttpBase<TEntity> extends RepositoryBase<TEntity>  {
    async handelMap(response: Response): Promise<ResultArray<TEntity>> {
        const result = new ResultArray<TEntity>();
        let entity = this.getNew();
        let entities = new Array<TEntity>();
        const resData = await response.json();
        if (!response.ok || response.status === 304) {
            result.status = response.status;
            result.ok = response.ok;
            result.message = JSON.stringify(resData)
            return result;
        }
        if (!resData || !resData.Documents || !Array.isArray(resData.Documents)) {
            result.ok = false;
            result.status = 501;
            result.message = JSON.stringify(resData)
            return result;
        }

        entities = await this.innerMap(resData);
        result.ok = true;
        result.status = 200;
        result.message = "";
        result.entity = entities;
        return result;

    }
}