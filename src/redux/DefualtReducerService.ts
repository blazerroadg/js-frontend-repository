import { nullValue } from 'js-frontend-repository/models/nullValue';
import { BaseReducer } from './BaseReducer';
import { DefaultReducer } from './DefaultReducer';

export class DefualtReducerService<TState> {
    state: TState;

    reducers: Array<BaseReducer<TState>>;

    reducer: BaseReducer<TState> = nullValue;

    constructor(state: TState, reducers: Array<BaseReducer<TState>>) {
      this.state = state;
      this.reducers = reducers;
      this.chain();
    }

    pairwise(arr: Array<BaseReducer<TState>>, func: any) {
      for (let i = 0; i < arr.length; i++) {
        if (i === arr.length) {
          arr[i].setSuccessor(new DefaultReducer<TState>(this.state));
          return;
        }
        func(arr[i], arr[i + 1]);
      }
    }

    chain(): void {
      const defaultSuccessor = new DefaultReducer<TState>(this.state);
      if (this.reducers && this.reducers.length > 0) {
        this.pairwise(this.reducers, (current: BaseReducer<TState>, next: BaseReducer<TState>) => {
          const succeror = next || defaultSuccessor;
          current.setSuccessor(succeror);
        });
        this.reducer = this.reducers[0];
        return;
      }
      this.reducer = defaultSuccessor;
    }

    reduce(state: TState = this.state, action: any): TState {
      return this.reducer.handleRequest(state, action);
    }
}
