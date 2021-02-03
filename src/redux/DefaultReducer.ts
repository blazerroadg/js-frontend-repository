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
    const nested =   action.type.indexOf('.') > -1 
    if(!nested){
      return {...state, [action.type]: action.entity};
    }
    debugger;
    const spl = action.type.split('.')
    const ex = (state as any)[spl[0]];
    const result =  {...state, [spl[0]]: {...ex,[spl[1]]:action.entity}};
    return result;

    };
  return provider;
};
