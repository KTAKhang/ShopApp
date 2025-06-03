import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createProduct,
    updateProduct,
    getProducts,
    getProductById
} from '../../services/productService';

const initialState = {
    products: [],
    product: null,
    isLoading: false,
    error: null,
    createProductStatus: null, // Trạng thái khi tạo sản phẩm
    updateProductStatus: null, // Trạng thái khi cập nhật sản phẩm
    fetchProductsStatus: null, // Trạng thái khi lấy danh sách sản phẩm
};

export const createProductAsync = createAsyncThunk(
    'product/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await createProduct(productData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProductAsync = createAsyncThunk(
    'product/updateProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await updateProduct(productData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductsAsync = createAsyncThunk(
    'product/fetchProducts',
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const response = await getProducts({ page, limit });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductByIdAsync = createAsyncThunk(
    'product/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getProductById(id);
            return response;
        } catch (error) {
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
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Product
            .addCase(createProductAsync.pending, (state) => {
                state.isLoading = true;
                state.createProductStatus = null;
            })
            .addCase(createProductAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.createProductStatus = 'success';
                state.products.push(action.payload);
            })
            .addCase(createProductAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.createProductStatus = 'error';
                state.error = action.payload;
            })
            // Update Product
            .addCase(updateProductAsync.pending, (state) => {
                state.isLoading = true;
                state.updateProductStatus = null;
            })
            .addCase(updateProductAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updateProductStatus = 'success';
                const index = state.products.findIndex(
                    (product) => product.id === action.payload.id
                );
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProductAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.updateProductStatus = 'error';
                state.error = action.payload;
            })
            // Fetch Products
            .addCase(fetchProductsAsync.pending, (state) => {
                state.isLoading = true;
                state.fetchProductsStatus = null;
            })
            .addCase(fetchProductsAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.fetchProductsStatus = 'success';
                state.products = action.payload.products;
            })
            .addCase(fetchProductsAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.fetchProductsStatus = 'error';
                state.error = action.payload;
            })
            // Fetch Product By ID
            .addCase(fetchProductByIdAsync.pending, (state) => {
                state.isLoading = true;
                state.product = null;
            })
            .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.product = action.payload.product;
            })
            .addCase(fetchProductByIdAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.product = null;
                state.error = action.payload;
            });
    },
});

export const { resetProductState, clearError } = productSlice.actions;
export default productSlice.reducer;
