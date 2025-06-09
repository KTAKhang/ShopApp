import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createProduct,
    updateProduct,
    getProducts,
    getProductById
} from '../../services/productService';

// Initial state cho product
const initialState = {
    products: [],
    allProducts: [], // Separate state for all products page
    product: null,
    isLoading: false,
    error: null,
    createProductStatus: null,
    updateProductStatus: null,
    fetchProductsStatus: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: true
    }
};



export const createProductAsync = createAsyncThunk(
    'product/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await createProduct(productData);
            return response; // Trả về response sau khi tạo sản phẩm
        } catch (error) {
            return rejectWithValue(error.message);  // Xử lý lỗi nếu có
        }
    }
);

export const updateProductAsync = createAsyncThunk(
    'product/updateProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await updateProduct(productData);
            return response; // Trả về response sau khi cập nhật sản phẩm
        } catch (error) {
            return rejectWithValue(error.message);  // Xử lý lỗi nếu có
        }
    }
);

export const fetchProductsAsync = createAsyncThunk(
    'product/fetchProducts',
    async ({ page, limit, isAllProducts = false, categoryId = null }, { rejectWithValue }) => {
        try {
            const response = await getProducts({ page, limit, categoryId });
            return {
                products: response.data.products,
                pagination: response.data.total,
                isAllProducts
            };
        } catch (error) {
            console.error('API error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductByIdAsync = createAsyncThunk(
    'product/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getProductById(id);
            console.log('API Response:', response); // Debug log
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
            state.createProductStatus = null;
            state.updateProductStatus = null;
            state.fetchProductsStatus = null;
            state.product = null;
            state.error = null; // Thêm dòng này
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
                
                if (action.payload.isAllProducts) {
                    // Handle pagination for all products page
                    if (action.meta.arg.page === 1) {
                        state.allProducts = action.payload.products;
                    } else {
                        state.allProducts = [...state.allProducts, ...action.payload.products];
                    }
                    state.pagination.currentPage = action.meta.arg.page;
                    state.pagination.hasMore = action.payload.products.length === action.meta.arg.limit;
                } else {
                    // Handle featured products
                    state.products = action.payload.products;
                }
            })
            .addCase(fetchProductsAsync.rejected, (state, action) => {
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
