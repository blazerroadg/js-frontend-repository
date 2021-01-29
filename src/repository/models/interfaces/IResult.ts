export interface IResult<TEntity> {
  ok: boolean;
  status: number;
  message: string;
  entities: Array<TEntity>;
  entity: TEntity;
}
