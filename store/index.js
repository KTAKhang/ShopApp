import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import reviewReducer from './slices/reviewSlice';
import categoryReducer from './slices/categorySlice'; // Import categoryReducer
import productReducer from './slices/productSlice'; // Import productReducer


export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        order: orderReducer,
        cart: cartReducer,
        review: reviewReducer,
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
