import { nullValue } from 'js-frontend-repository/models/nullValue';
import { IReducer } from './IReducer';

export abstract class BaseReducer<TState> implements IReducer<TState> {
    state: TState;

    acceptableActions: Array<string>;

    protected successor: BaseReducer<TState> = nullValue;

    constructor(state: TState, acceptableActions: Array<string>) {
      this.state = state;
      this.acceptableActions = acceptableActions;
    }

    isAcceptable(actionName: string): boolean {
      return this.acceptableActions.some((t) => t === actionName);
    }

    public setSuccessor(successor: BaseReducer<TState>): void {
      this.successor = successor;
    }

    public handleRequest(state: TState, action: any): TState {
      if (this.isAcceptable(action.type)) {
        return this.reduce(state, action);
      }
      if (this.successor) {
        return this.successor.handleRequest(state, action);
      }
      return state;
    }

    abstract reduce(state: TState, action: any): TState
}
