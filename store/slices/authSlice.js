import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await loginApi({ email, password });

            // Save token to AsyncStorage
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        return null;
    }
);

// Async thunk to check if user is already logged in
export const checkAuthStatus = createAsyncThunk(
    'auth/checkAuthStatus',
    async (_, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const user = await AsyncStorage.getItem('user');

            if (token && user) {
                return {
                    token,
                    user: JSON.parse(user),
                };
            }
            return null;
        } catch (error) {
            return rejectWithValue('Failed to check auth status');
        }
    }
);

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Logout cases
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // Check auth status cases
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                }
            });
    },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;