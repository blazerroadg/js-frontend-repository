import Param from './Param';

export default class QueryContext {
  query: string;

  parameters: Array<Param>

  constructor(query: string, parameters: Array<Param>) {
    this.query = query;
    this.parameters = parameters;
  }
}
