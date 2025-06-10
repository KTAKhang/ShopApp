import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createOrderApi,
    getOrderByUserApi,
    cancelOrderApi,
} from '../../services/orderService';

// Async thunk for fetching orders by user
export const fetchOrderByUser = createAsyncThunk(
    'order/fetchOrderByUser',
    async ({ page = 1, limit = 5 }, { rejectWithValue }) => {
        try {
            console.log("hihi")
            const response = await getOrderByUserApi(page, limit);
            return response;
        } catch (error) {
            console.error('fetchOrderByUser error:', error);
            return rejectWithValue(error.message || 'Failed to fetch orders');
        }
    }
);



export const createOrder = createAsyncThunk(
    'order/createOrder',
    async ({ selected_product_ids, receiverInfo }, { rejectWithValue }) => {
        try {
            console.log("selectedItems in slice", selected_product_ids);
            const response = await createOrderApi({ selected_product_ids, receiverInfo });
            return response;
        } catch (error) {
            console.log('createOrder error:', error);
            return rejectWithValue(error.message);
        }
    }
);
export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async (order_id, { rejectWithValue }) => {
        try {
            const response = await cancelOrderApi(order_id);
            return { order_id, message: response.message };
        } catch (error) {
            console.log('cancelOrder error:', error);
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    orders: [],
    isLoading: false,
    error: null,
    createSuccess: false,
    newOrderId: null,
    cancelSuccess: false,
    cancelMessage: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrderState: (state) => {
            state.orders = [];
            state.isLoading = false;
            state.error = null;
            state.createSuccess = false;
            state.newOrderId = null;
            state.cancelSuccess = false;
            state.cancelMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch orders by user
            .addCase(fetchOrderByUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderByUser.fulfilled, (state, action) => {
                console("orders slice", action.payload);
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderByUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
                state.createSuccess = false;
                state.newOrderId = null;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.createSuccess = true;
                state.newOrderId = action.payload.order_id;
                state.error = null;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.createSuccess = false;
                state.newOrderId = null;
                state.error = action.payload;
            })
            // Cancel order
            .addCase(cancelOrder.pending, (state) => {
                state.isLoading = true;
                state.cancelSuccess = false;
                state.cancelMessage = null;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cancelSuccess = true;
                state.cancelMessage = action.payload.message;

                // Cập nhật trạng thái đơn hàng trong danh sách
                state.orders = state.orders.map(order =>
                    order._id === action.payload.order_id
                        ? { ...order, status: 'cancelled' }
                        : order
                );
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.cancelSuccess = false;
                state.cancelMessage = null;
                state.error = action.payload;
            });
    },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
