import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getOrderByUserApi,
    createOrder,
    updateOrder,
    cancelOrder,
    getOrderDetailsById
} from '../../services/orderService';

// Async thunk for fetching orders by user
export const fetchOrderByUser = createAsyncThunk(
    'order/fetchOrderByUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getOrderByUserApi();
            return response;
        } catch (error) {
            console.log('fetchOrderByUser error:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for creating order
export const createOrderAsync = createAsyncThunk(
    'order/createOrder',
    async ({ selected_product_ids, receiverInfo }, { rejectWithValue }) => {
        try {
            const response = await createOrder({ selected_product_ids, receiverInfo });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for updating order
export const updateOrderAsync = createAsyncThunk(
    'order/updateOrder',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateOrder({ id, updateData });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for canceling order
export const cancelOrderAsync = createAsyncThunk(
    'order/cancelOrder',
    async (id, { rejectWithValue }) => {
        try {
            const response = await cancelOrder(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for getting order details by ID
export const getOrderDetailsAsync = createAsyncThunk(
    'order/getOrderDetailsById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getOrderDetailsById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    orders: [],
    order: null,
    isLoading: false,
    error: null,
    createOrderStatus: null,
    updateOrderStatus: null,
    cancelOrderStatus: null,
    orderDetailsStatus: null,
    message: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrderState: (state) => {
            state.orders = [];
            state.order = null;
            state.isLoading = false;
            state.error = null;
            state.createOrderStatus = null;
            state.updateOrderStatus = null;
            state.cancelOrderStatus = null;
            state.orderDetailsStatus = null;
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
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderByUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create order
            .addCase(createOrderAsync.pending, (state) => {
                state.isLoading = true;
                state.createOrderStatus = null;
            })
            .addCase(createOrderAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.createOrderStatus = 'success';
                state.message = action.payload.message;
                state.orders.push(action.payload); // Assuming the created order is returned
            })
            .addCase(createOrderAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.createOrderStatus = 'error';
                state.error = action.payload;
            })
            // Update order
            .addCase(updateOrderAsync.pending, (state) => {
                state.isLoading = true;
                state.updateOrderStatus = null;
            })
            .addCase(updateOrderAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updateOrderStatus = 'success';
                state.message = action.payload.message;
                const index = state.orders.findIndex(
                    (order) => order.id === action.payload.id
                );
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(updateOrderAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.updateOrderStatus = 'error';
                state.error = action.payload;
            })
            // Cancel order
            .addCase(cancelOrderAsync.pending, (state) => {
                state.isLoading = true;
                state.cancelOrderStatus = null;
            })
            .addCase(cancelOrderAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cancelOrderStatus = 'success';
                state.message = action.payload.message;
                state.orders = state.orders.filter((order) => order.id !== action.payload.id);
            })
            .addCase(cancelOrderAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.cancelOrderStatus = 'error';
                state.error = action.payload;
            })
            // Get order details by ID
            .addCase(getOrderDetailsAsync.pending, (state) => {
                state.isLoading = true;
                state.orderDetailsStatus = null;
            })
            .addCase(getOrderDetailsAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderDetailsStatus = 'success';
                state.order = action.payload;
            })
            .addCase(getOrderDetailsAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.orderDetailsStatus = 'error';
                state.error = action.payload;
            });
    },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
