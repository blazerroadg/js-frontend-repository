import { AppState } from '@/src/models/AppState';
import { DefualtReducerService } from 'react-redux-repository/DefualtReducerService';
import { TitleReducer } from './TitleReducer';

export class AppReducerService extends DefualtReducerService<AppState> {
  constructor() {
    const appState = new AppState();
    super(appState, [
      new TitleReducer(appState, ['SETTITLE']),
    ]);
  }
}
