import {baseReducer, IReducerProvider} from './baseReducer';

export const defaultReducer = <TState>(
  state: TState,
): IReducerProvider<TState> => {
  const fillAcceptable = (state: TState): Array<string> => {
    const acceptableActions: Array<string> = [];
    Object.keys(state).forEach((key) => {
      acceptableActions.push(key);
    });
    return acceptableActions;
  };
  const provider: IReducerProvider<TState> = {
    ...baseReducer(state, fillAcceptable(state)),
    reduce: (state: TState, action: any): TState => {
      return {...state, [action.type]: action.entity};
    },
  };
  return provider;
};
