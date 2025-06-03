import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import orderReducer from './slices/orderSlice';
import categoryReducer from './slices/categorySlice'; // Import categoryReducer
import productReducer from './slices/productSlice'; // Import productReducer

// Cấu hình Redux store
export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        order: orderReducer,
        category: categoryReducer, // Thêm categoryReducer vào store
        product: productReducer, // Thêm productReducer vào store
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
