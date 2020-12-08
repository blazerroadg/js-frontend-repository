
export interface IResult<TEntity> {
    ok: boolean;
    status: number;
    message: string;
    entity: TEntity | Array<TEntity>;
}