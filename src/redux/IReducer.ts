export interface IReducer<TState> {
    state: TState;
    acceptableActions: Array<string>;
    reduce(state: TState, action: any): TState
}
