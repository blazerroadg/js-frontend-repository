import {Param} from './Param';

export interface QueryContext {
  query: string;
  parameters: Array<Param>;
}
