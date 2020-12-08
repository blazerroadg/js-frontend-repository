
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { crashReporter, vanillaPromise, readyStatePromise } from "./store/middleware/middleware";

import { appReducer } from './store/reducers/reducersFacad'
import { Services } from "./store/actions/services/UnitOfWork"

const store = createStore(appReducer, applyMiddleware(crashReporter, vanillaPromise, readyStatePromise));
Services.init(store);

export default function App() {
  return (
    <Provider store={store}>
      <MainNavigation />
    </Provider>
  );
}


