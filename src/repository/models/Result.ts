import { IResult } from './interfaces/IResult';
import { nullValue } from './nullValue';

export class Result<TEntity> implements IResult<TEntity> {
    ok = true;

    status = 200;

    message = '';

    entity: TEntity = nullValue;
}
