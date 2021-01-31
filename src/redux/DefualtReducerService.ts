import {nullValue} from 'js-frontend-repository/models/nullValue';
import {IReducerProvider} from './BaseReducer';
import {defaultReducer} from './defaultReducer';

export const defualtReducerService = <TState>(
  state: TState,
  reducers: Array<IReducerProvider<TState>>,
): {(action: any): TState} => {
  let reducer: IReducerProvider<TState> = nullValue;
  const pairwise = (arr: Array<IReducerProvider<TState>>, func: any): void => {
    for (let i = 0; i < arr.length; i++) {
      if (i === arr.length) {
        arr[i].setSuccessor(defaultReducer<TState>(state));
        return;
      }
      func(arr[i], arr[i + 1]);
    }
  };
  const chain = (): void => {
    const defaultSuccessor = defaultReducer<TState>(state);
    if (reducers && reducers.length > 0) {
      pairwise(
        reducers,
        (current: IReducerProvider<TState>, next: IReducerProvider<TState>) => {
          const succeror = next || defaultSuccessor;
          current.setSuccessor(succeror);
        },
      );
      reducer = reducers[0];
      return;
    }
    reducer = defaultSuccessor;
  };
  chain();
  const reduce = (action: any): TState => {
    return reducer.handleRequest(state, action);
  };
  return reduce;
};
