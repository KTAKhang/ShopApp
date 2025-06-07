import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductReviewsByProductId } from '../../services/reviewService';

// Async thunk for fetching product reviews by product ID
export const fetchProductReviewsByProductId = createAsyncThunk(
    'review/fetchProductReviewsByProductId',
    async (product_id, { rejectWithValue }) => {
        try {
            const response = await getProductReviewsByProductId(product_id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    reviews: [],
    isLoading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReviewState: (state) => {
            state.reviews = [];
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch product reviews by product ID
            .addCase(fetchProductReviewsByProductId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductReviewsByProductId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload;
                state.error = null;
            })
            .addCase(fetchProductReviewsByProductId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
