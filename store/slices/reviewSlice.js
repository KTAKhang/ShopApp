import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createReviewApi, updateReviewApi, getReviewsByOrderIdApi } from '../../services/reviewService';

export const createReview = createAsyncThunk(
    'review/createReview',
    async ({ product_id, order_detail_id, rating, review_content }, { rejectWithValue }) => {
        try {
            const response = await createReviewApi({ product_id, order_detail_id, rating, review_content });
            return response.review;
        } catch (error) {
            console.log('createReview error:', error);
            return rejectWithValue(error.message);
        }
    }
);
export const updateReview = createAsyncThunk(
    'review/updateReview',
    async ({ review_id, rating, review_content }, { rejectWithValue }) => {
        try {
            const response = await updateReviewApi({ review_id, rating, review_content });
            return response.review;
        } catch (error) {
            console.log('updateReview error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const getReviewsByOrderId = createAsyncThunk(
    'review/getReviewsByOrderId',
    async (order_id, { rejectWithValue }) => {
        try {
            const reviews = await getReviewsByOrderIdApi(order_id);
            return reviews;
        } catch (error) {
            console.log('getReviewsByOrderId error:', error);
            return rejectWithValue(error.message);
        }
    }
);



const initialState = {
    review: null,
    isLoading: false,
    error: null,
    successMessage: null,
    lastAction: null,
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReviewState: (state) => {
            state.review = null;
            state.isLoading = false;
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createReview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = false;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.isLoading = false;
                state.review = action.payload;
                state.successMessage = true;
                state.lastAction = 'create';
            })
            .addCase(createReview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateReview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = false;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.isLoading = false;
                state.review = action.payload;
                state.successMessage = true;
                state.lastAction = 'update';
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getReviewsByOrderId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getReviewsByOrderId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.review = action.payload;
                state.lastAction = 'fetch';
            })
            .addCase(getReviewsByOrderId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
    },
});

export const { clearReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
