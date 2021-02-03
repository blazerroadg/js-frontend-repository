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
  const provider = baseReducer(state, fillAcceptable(state));
  provider.reduce = (state: TState, action: any): TState => {
    const spl = action.type.split('.');
    if (spl.length == 1) {
      return {...state, [action.type]: action.entity};
    }
    return {...state, [spl[0]]: {...spl[0], [spl[1]]: action.entity}};
  };
  return provider;
};
