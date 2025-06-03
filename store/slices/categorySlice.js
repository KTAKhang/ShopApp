import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createCategory, updateCategory, getCategories, getCategoryById } from '../../services/categoryService';

const initialState = {
    categories: [],
    category: null,
    isLoading: false,
    error: null,
    createCategoryStatus: null, // Trạng thái khi tạo danh mục
    updateCategoryStatus: null, // Trạng thái khi cập nhật danh mục
    fetchCategoriesStatus: null, // Trạng thái khi lấy danh sách danh mục
};

export const createCategoryAsync = createAsyncThunk(
    'category/createCategory',
    async ({ name, image }, { rejectWithValue }) => {
        try {
            const response = await createCategory({ name, image });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCategoryAsync = createAsyncThunk(
    'category/updateCategory',
    async ({ id, name, status, image }, { rejectWithValue }) => {
        try {
            const response = await updateCategory({ id, name, status, image });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCategoriesAsync = createAsyncThunk(
    'category/fetchCategories',
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const response = await getCategories({ page, limit });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCategoryByIdAsync = createAsyncThunk(
    'category/fetchCategoryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getCategoryById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        resetCategoryState: (state) => {
            state.createCategoryStatus = null;
            state.updateCategoryStatus = null;
            state.fetchCategoriesStatus = null;
            state.category = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Category
            .addCase(createCategoryAsync.pending, (state) => {
                state.isLoading = true;
                state.createCategoryStatus = null;
            })
            .addCase(createCategoryAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.createCategoryStatus = 'success';
                state.categories.push(action.payload);
            })
            .addCase(createCategoryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.createCategoryStatus = 'error';
                state.error = action.payload;
            })
            // Update Category
            .addCase(updateCategoryAsync.pending, (state) => {
                state.isLoading = true;
                state.updateCategoryStatus = null;
            })
            .addCase(updateCategoryAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updateCategoryStatus = 'success';
                const index = state.categories.findIndex(
                    (category) => category.id === action.payload.id
                );
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateCategoryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.updateCategoryStatus = 'error';
                state.error = action.payload;
            })
            // Fetch Categories
            .addCase(fetchCategoriesAsync.pending, (state) => {
                state.isLoading = true;
                state.fetchCategoriesStatus = null;
            })
            .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.fetchCategoriesStatus = 'success';
                state.categories = action.payload.categories;
            })
            .addCase(fetchCategoriesAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.fetchCategoriesStatus = 'error';
                state.error = action.payload;
            })
            // Fetch Category By ID
            .addCase(fetchCategoryByIdAsync.pending, (state) => {
                state.isLoading = true;
                state.category = null;
            })
            .addCase(fetchCategoryByIdAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.category = action.payload.category;
            })
            .addCase(fetchCategoryByIdAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.category = null;
                state.error = action.payload;
            });
    },
});

export const { resetCategoryState, clearError } = categorySlice.actions;
export default categorySlice.reducer;
