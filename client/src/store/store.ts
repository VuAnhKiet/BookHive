import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { graphqlApi } from '../services/graphqlApi';
import authReducer, {
  ACCESS_TOKEN_KEY,
  clearCredentials,
  setCredentials,
} from './authSlice';
import readerAreaReducer, {
  READER_AREA_KEY,
  setReaderArea,
} from './readerAreaSlice';

const readerAreaListener = createListenerMiddleware();
const authListener = createListenerMiddleware();

authListener.startListening({
  actionCreator: setCredentials,
  effect: (action) => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.accessToken);
  },
});

authListener.startListening({
  actionCreator: clearCredentials,
  effect: () => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
});

readerAreaListener.startListening({
  actionCreator: setReaderArea,
  effect: (action) => {
    if (action.payload) {
      window.localStorage.setItem(READER_AREA_KEY, action.payload);
    } else {
      window.localStorage.removeItem(READER_AREA_KEY);
    }
  },
});

export const store = configureStore({
  reducer: {
    [graphqlApi.reducerPath]: graphqlApi.reducer,
    auth: authReducer,
    readerArea: readerAreaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      graphqlApi.middleware,
      readerAreaListener.middleware,
      authListener.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
