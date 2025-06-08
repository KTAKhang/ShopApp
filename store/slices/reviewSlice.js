import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductReviewsByProductId } from '../../services/reviewService';

// Async thunk for fetching product reviews by product ID
export const fetchProductReviewsByProductId = createAsyncThunk(
    'review/fetchProductReviewsByProductId',
    async (product_id, { rejectWithValue }) => {
        try {
            const response = await getProductReviewsByProductId(product_id);
            return { product_id, reviews: response };
        } catch (error) {
            return rejectWithValue({ product_id, error: error.message });
        }
    }
);

const initialState = {
    reviewsByProduct: {}, // Store reviews by product ID: { productId: { reviews: [], isLoading: false, error: null } }
    isLoading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReviewState: (state) => {
            state.reviewsByProduct = {};
            state.isLoading = false;
            state.error = null;
        },
        clearProductReviews: (state, action) => {
            const productId = action.payload;
            if (state.reviewsByProduct[productId]) {
                delete state.reviewsByProduct[productId];
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch product reviews by product ID
            .addCase(fetchProductReviewsByProductId.pending, (state, action) => {
                const productId = action.meta.arg;
                // Khởi tạo state cho sản phẩm cụ thể nếu chưa có
                if (!state.reviewsByProduct[productId]) {
                    state.reviewsByProduct[productId] = {
                        reviews: [],
                        isLoading: false,
                        error: null,
                    };
                }
                state.reviewsByProduct[productId].isLoading = true;
                state.reviewsByProduct[productId].error = null;
            })
            .addCase(fetchProductReviewsByProductId.fulfilled, (state, action) => {
                const { product_id, reviews } = action.payload;
                // Khởi tạo state cho sản phẩm cụ thể nếu chưa có
                if (!state.reviewsByProduct[product_id]) {
                    state.reviewsByProduct[product_id] = {
                        reviews: [],
                        isLoading: false,
                        error: null,
                    };
                }
                // Chỉ cập nhật reviews cho sản phẩm cụ thể
                state.reviewsByProduct[product_id].reviews = reviews || [];
                state.reviewsByProduct[product_id].isLoading = false;
                state.reviewsByProduct[product_id].error = null;
            })
            .addCase(fetchProductReviewsByProductId.rejected, (state, action) => {
                const { product_id, error } = action.payload || {};
                if (product_id) {
                    // Khởi tạo state cho sản phẩm cụ thể nếu chưa có
                    if (!state.reviewsByProduct[product_id]) {
                        state.reviewsByProduct[product_id] = {
                            reviews: [],
                            isLoading: false,
                            error: null,
                        };
                    }
                    state.reviewsByProduct[product_id].isLoading = false;
                    state.reviewsByProduct[product_id].error = error || 'Failed to fetch reviews';
                }
            });
    },
});

export const { clearReviewState, clearProductReviews } = reviewSlice.actions;

// Selectors - Đảm bảo chỉ trả về reviews của sản phẩm cụ thể
export const selectProductReviews = (state, productId) => {
    if (!productId || !state.review.reviewsByProduct[productId]) {
        return [];
    }
    return state.review.reviewsByProduct[productId].reviews || [];
};

export const selectProductReviewsLoading = (state, productId) => {
    if (!productId || !state.review.reviewsByProduct[productId]) {
        return false;
    }
    return state.review.reviewsByProduct[productId].isLoading || false;
};

export const selectProductReviewsError = (state, productId) => {
    if (!productId || !state.review.reviewsByProduct[productId]) {
        return null;
    }
    return state.review.reviewsByProduct[productId].error || null;
};

export default reviewSlice.reducer;