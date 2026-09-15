import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSlice from '@/store/authSlice.ts';
import modelsReducer from '@/store/modelsSlice.ts';

export const store = configureStore({
  reducer: {
    [authSlice.reducerPath]: authSlice.reducer,
    models: modelsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
