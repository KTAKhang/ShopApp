// features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCartByUserApi, updateCartApi, removeFromCartApi } from '../../services/cartService';

export const fetchCartByUser = createAsyncThunk(
    'cart/fetchCartByUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCartByUserApi();
            return response;
        } catch (error) {
            console.log('fetchCartByUser error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ product_id, quantity }, { rejectWithValue, dispatch }) => {
        try {
            const result = await updateCartApi({ product_id, quantity });

            // Gọi lại API giỏ hàng để đồng bộ dữ liệu mới nhất
            const updatedCart = await getCartByUserApi();
            return updatedCart;
        } catch (error) {
            console.log('updateCartItem error:', error);
            return rejectWithValue(error.message);
        }
    }
);
export const removeCartItem = createAsyncThunk(
    'cart/removeCartItem',
    async (product_id, { rejectWithValue }) => {
        try {
            await removeFromCartApi(product_id);

            // Gọi lại API giỏ hàng sau khi xóa
            const updatedCart = await getCartByUserApi();
            return updatedCart;
        } catch (error) {
            console.log('removeCartItem error:', error);
            return rejectWithValue(error.message);
        }
    }
);


const initialState = {
    cart: {},
    isLoading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartState: (state) => {
            state.cart = null;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartByUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCartByUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cart = action.payload;
                state.error = null;
            })
            .addCase(fetchCartByUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateCartItem.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cart = action.payload;
                state.error = null;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(removeCartItem.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cart = action.payload;
                state.error = null;
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

    },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
