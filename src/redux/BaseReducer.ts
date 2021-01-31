import {nullValue} from 'js-frontend-repository/models/nullValue';
import {IReducer} from './IReducer';

export interface IReducerProvider<TState> extends IReducer<TState> {
  isAcceptable(actionName: string): boolean;
  setSuccessor(successor: IReducerProvider<TState>): void;
  handleRequest(state: TState, action: any): TState;
  successor: IReducerProvider<TState>;
}

export const baseReducer = <TState>(
  state: TState,
  acceptableActions: Array<string>,
): IReducerProvider<TState> => {
  const reducer: IReducerProvider<TState> = {
    isAcceptable: (actionName: string) => {
      return acceptableActions.some((t) => t === actionName);
    },
    setSuccessor: (successor: IReducerProvider<TState>): void => {
      reducer.successor = successor;
    },
    acceptableActions: acceptableActions,
    handleRequest: (state: TState, action: any): TState => {
      if (reducer.isAcceptable(action.type)) {
        return reducer.reduce(state, action);
      }
      if (reducer.successor) {
        return reducer.successor.handleRequest(state, action);
      }
      return state;
    },
    state: state,
    successor: nullValue,
    reduce: nullValue,
  };
  return reducer;
};