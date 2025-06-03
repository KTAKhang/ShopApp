import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import reviewReducer from './slices/reviewSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        order: orderReducer,
        cart: cartReducer,
        review: reviewReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: true,
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;