import { BaseReducer } from './BaseReducer';

export class DefaultReducer<TState> extends BaseReducer<TState> {
  constructor(state: TState) {
    super(state, []);
    this.fillAcceptable(state);
  }

  fillAcceptable(state: TState) {
    Object.keys(state).forEach((key) => {
      this.acceptableActions.push(key);
    });
  }

  reduce(state: TState, action: any): TState {
    return { ...state, [action.type]: action.entity };
  }
}
