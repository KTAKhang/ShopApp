import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, sendOtpApi, confirmOtpApi, forgotPasswordApi } from '../../services/authService';
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

// Async thunk for sending OTP
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async ({ user_name, email, password }, { rejectWithValue }) => {
        try {
            const response = await sendOtpApi({ user_name, email, password });
            return response.message; // ví dụ: "OTP sent to email"
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for confirming OTP
export const confirmOtp = createAsyncThunk(
    'auth/confirmOtp',
    async (otp, { rejectWithValue }) => {
        try {
            const response = await confirmOtpApi(otp);
            return response.message; // ví dụ: "Register successfully"
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

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await forgotPasswordApi({ email });
            return response.message; // ví dụ: "OTP sent to email"
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    otpStatus: null,
    otpMessage: null,
    confirmOtpStatus: null,
    confirmOtpMessage: null,
    forgotPasswordStatus: null,  // Trạng thái quên mật khẩu
    forgotPasswordMessage: null, // Thông báo quên mật khẩu
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
            //Register OTP cases
            .addCase(sendOtp.pending, (state) => {
                state.isLoading = true;
                state.otpStatus = null;
                state.otpMessage = null;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.otpStatus = 'success';
                state.otpMessage = action.payload;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.otpStatus = 'error';
                state.otpMessage = action.payload;
            })
            // Confirm OTP cases
            .addCase(confirmOtp.pending, (state) => {
                state.isLoading = true;
                state.confirmOtpStatus = null;
                state.confirmOtpMessage = null;
            })
            .addCase(confirmOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.confirmOtpStatus = 'success';
                state.otpStatus = null;
                state.confirmOtpMessage = action.payload;
            })
            .addCase(confirmOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.confirmOtpStatus = 'error';
                state.confirmOtpMessage = action.payload;
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
            })
            // Forgot password case
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.forgotPasswordStatus = null;
                state.forgotPasswordMessage = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.forgotPasswordStatus = 'success';
                state.forgotPasswordMessage = action.payload;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.forgotPasswordStatus = 'error';
                state.forgotPasswordMessage = action.payload;
            });
    },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;