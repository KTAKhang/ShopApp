import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderByUserApi } from '../../services/orderService';

export const fetchOrderByUser = createAsyncThunk(
    'order/fetchOrderByUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getOrderByUserApi();
            return response;
        } catch (error) {
            console.log('fetchOrderByUser error:', error); // <-- quan trọng
            return rejectWithValue(error.message);
        }

    }
);

const initialState = {
    orders: [],
    isLoading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrderState: (state) => {
            state.orders = null;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderByUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderByUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderByUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
