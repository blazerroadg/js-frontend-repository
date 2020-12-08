import { IResult } from './interfaces/IResult';
import { nullValue } from './nullValue';

export class ResultArray<TEntity> implements IResult<TEntity> {
    ok = true;

    status = 200;

    message = '';

    entity: Array<TEntity> = nullValue;
}
