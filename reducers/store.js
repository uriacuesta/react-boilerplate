import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './root.reducer';
import { composeWithDevTools } from 'redux-devtools-extension';

const defaultMiddleware = applyMiddleware(thunk);

const middleware = (() => {
  if( process.env.NODE_ENV === 'development') {
    console.log('ENABLED WITH REACT_DEV_TOOLS');
    return composeWithDevTools(defaultMiddleware);
  }

  return defaultMiddleware;
})();

export default createStore(rootReducer, middleware);
