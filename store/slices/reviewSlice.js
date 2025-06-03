import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createProductReview,
    updateProductReview,
    getProductReviewsByUser,
    getAllProductReviews,
    getAllReviews
} from '../../services/reviewService';

const initialState = {
    reviews: [],
    productReviews: [],
    review: null,
    isLoading: false,
    error: null,
    createReviewStatus: null, // Trạng thái khi tạo đánh giá
    updateReviewStatus: null, // Trạng thái khi cập nhật đánh giá
    fetchReviewsStatus: null, // Trạng thái khi lấy đánh giá sản phẩm
    fetchAllReviewsStatus: null, // Trạng thái khi lấy tất cả đánh giá
};

export const createReviewAsync = createAsyncThunk(
    'review/createReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await createProductReview(reviewData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateReviewAsync = createAsyncThunk(
    'review/updateReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await updateProductReview(reviewData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductReviewsByUserAsync = createAsyncThunk(
    'review/fetchProductReviewsByUser',
    async (product_id, { rejectWithValue }) => {
        try {
            const response = await getProductReviewsByUser(product_id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAllProductReviewsAsync = createAsyncThunk(
    'review/fetchAllProductReviews',
    async (product_id, { rejectWithValue }) => {
        try {
            const response = await getAllProductReviews(product_id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAllReviewsAsync = createAsyncThunk(
    'review/fetchAllReviews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllReviews();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        resetReviewState: (state) => {
            state.createReviewStatus = null;
            state.updateReviewStatus = null;
            state.fetchReviewsStatus = null;
            state.fetchAllReviewsStatus = null;
            state.productReviews = [];
            state.reviews = [];
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Review
            .addCase(createReviewAsync.pending, (state) => {
                state.isLoading = true;
                state.createReviewStatus = null;
            })
            .addCase(createReviewAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.createReviewStatus = 'success';
                state.reviews.push(action.payload);
            })
            .addCase(createReviewAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.createReviewStatus = 'error';
                state.error = action.payload;
            })
            // Update Review
            .addCase(updateReviewAsync.pending, (state) => {
                state.isLoading = true;
                state.updateReviewStatus = null;
            })
            .addCase(updateReviewAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updateReviewStatus = 'success';
                const index = state.reviews.findIndex(
                    (review) => review.id === action.payload.id
                );
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            })
            .addCase(updateReviewAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.updateReviewStatus = 'error';
                state.error = action.payload;
            })
            // Fetch Reviews By User
            .addCase(fetchProductReviewsByUserAsync.pending, (state) => {
                state.isLoading = true;
                state.fetchReviewsStatus = null;
            })
            .addCase(fetchProductReviewsByUserAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.fetchReviewsStatus = 'success';
                state.productReviews = action.payload.reviews;
            })
            .addCase(fetchProductReviewsByUserAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.fetchReviewsStatus = 'error';
                state.error = action.payload;
            })
            // Fetch All Reviews for Product
            .addCase(fetchAllProductReviewsAsync.pending, (state) => {
                state.isLoading = true;
                state.fetchAllReviewsStatus = null;
            })
            .addCase(fetchAllProductReviewsAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.fetchAllReviewsStatus = 'success';
                state.productReviews = action.payload.reviews;
            })
            .addCase(fetchAllProductReviewsAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.fetchAllReviewsStatus = 'error';
                state.error = action.payload;
            })
            // Fetch All Reviews (Admin)
            .addCase(fetchAllReviewsAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllReviewsAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload.reviews;
            })
            .addCase(fetchAllReviewsAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetReviewState, clearError } = reviewSlice.actions;
export default reviewSlice.reducer;
