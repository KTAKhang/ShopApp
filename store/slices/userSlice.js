import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getUserProfileApi,
    updateUserProfileApi,
    getAllUsers,
    getUserById
} from '../../services/userService';

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
    'user/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getUserProfileApi();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async ({ user_name, avatar }, { rejectWithValue }) => {
        try {
            const response = await updateUserProfileApi({ user_name, avatar });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for fetching all users (admin)
export const fetchAllUsers = createAsyncThunk(
    'user/fetchAllUsers',
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const response = await getAllUsers({ page, limit });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for fetching user by ID (admin)
export const fetchUserById = createAsyncThunk(
    'user/fetchUserById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getUserById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    profile: {},
    users: [],
    user: null,
    isLoading: false,
    error: null,
    isUpdateSuccess: false,
    fetchAllUsersStatus: null, // Thêm trạng thái lấy danh sách người dùng
    fetchUserByIdStatus: null, // Thêm trạng thái lấy thông tin người dùng theo ID
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserState: (state) => {
            state.profile = null;
            state.isLoading = false;
            state.error = null;
        },
        resetUpdateSuccess: (state) => {
            state.isUpdateSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch user profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update user profile
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.isUpdateSuccess = true;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch all users (Admin)
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
                state.fetchAllUsersStatus = null;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.fetchAllUsersStatus = 'success';
                state.users = action.payload.data;
                state.error = null;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.fetchAllUsersStatus = 'error';
                state.error = action.payload;
            })
            // Fetch user by ID (Admin)
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.fetchUserByIdStatus = null;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.fetchUserByIdStatus = 'success';
                state.user = action.payload.data;
                state.error = null;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.fetchUserByIdStatus = 'error';
                state.error = action.payload;
            });
    },
});

export const { clearUserState, resetUpdateSuccess } = userSlice.actions;
export default userSlice.reducer;
