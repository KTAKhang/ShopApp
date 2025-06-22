import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getProducts,
    getProductById,
    getProductsByCategory
} from '../../services/productService';

// Initial state cho product
const initialState = {
    products: [],
    allProducts: [], // Separate state for all products page
    product: null,
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: true
    }
};

export const fetchProductsAsync = createAsyncThunk(
    'product/fetchProducts',
    async ({ page, limit, isAllProducts = false, search = null }, { rejectWithValue }) => {
        try {
            const response = await getProducts({ page, limit, search });
            return {
                products: response.data.products,
                pagination: response.data.total,
                isAllProducts,
                page
            };
        } catch (error) {
            console.error('API error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductsByCategoryAsync = createAsyncThunk(
    'product/fetchProductsByCategory',
    async ({ category_name, page, limit }, { rejectWithValue }) => {
        try {
            console.log('fetchProductsByCategoryAsync called with:', { category_name, page, limit });
            const response = await getProductsByCategory({ category_name, page, limit });
            console.log('fetchProductsByCategoryAsync response:', response);
            return {
                products: response.data.products,
                pagination: response.data.total,
                isAllProducts: true,
                page
            };
        } catch (error) {
            console.error('fetchProductsByCategoryAsync error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductByIdAsync = createAsyncThunk(
    'product/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getProductById(id);

            return response;  // Trả về response thay vì response.product
        } catch (error) {
            console.error('fetchProductByIdAsync error:', error);
            return rejectWithValue(error.message);
        }
    }
);
const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        resetProductState: (state) => {
            state.product = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetAllProducts: (state) => {
            state.allProducts = [];
            state.pagination.currentPage = 1;
            state.pagination.hasMore = true;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProductsAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductsAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;

                // Filter chỉ lấy sản phẩm có status = true (active products)
                const activeProducts = action.payload.products.filter(product => product.status === true);

                if (action.payload.isAllProducts) {
                    // Handle pagination for all products page
                    if (action.payload.page === 1) {
                        // Reset products for new search or refresh
                        state.allProducts = activeProducts;
                    } else {
                        // Append products for load more
                        state.allProducts = [...state.allProducts, ...activeProducts];
                    }

                    // Update pagination based on API response
                    const { currentPage, totalPage } = action.payload.pagination;
                    state.pagination.currentPage = currentPage;
                    state.pagination.totalPages = totalPage;
                    state.pagination.hasMore = currentPage < totalPage;
                } else {
                    // Handle featured products - chỉ lấy sản phẩm active
                    state.products = activeProducts;
                }
            })
            .addCase(fetchProductsAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Products By Category
            .addCase(fetchProductsByCategoryAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductsByCategoryAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;

                // Filter chỉ lấy sản phẩm có status = true (active products)
                const activeProducts = action.payload.products.filter(product => product.status === true);

                // Handle pagination for category products
                if (action.payload.page === 1) {
                    // Reset products for new category or refresh
                    state.allProducts = activeProducts;
                } else {
                    // Append products for load more
                    state.allProducts = [...state.allProducts, ...activeProducts];
                }

                // Update pagination based on API response
                const { currentPage, totalPage } = action.payload.pagination;
                state.pagination.currentPage = currentPage;
                state.pagination.totalPages = totalPage;
                state.pagination.hasMore = currentPage < totalPage;
            })
            .addCase(fetchProductsByCategoryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Product By ID
            .addCase(fetchProductByIdAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.product = action.payload;
                state.error = null;
            })
            .addCase(fetchProductByIdAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.product = null;
                state.error = action.payload;
            });
    },
});

export const { resetProductState, clearError, resetAllProducts } = productSlice.actions;
export default productSlice.reducer;
