import { BaseReducer } from 'react-redux-repository/BaseReducer';
import { AppState } from '../../models/AppState';

export class TitleReducer extends BaseReducer<AppState> {
  reduce(state: AppState, action: any): AppState {
    const innerState = state;
    innerState.todo.title = action.title;
    return innerState;
  }
}
