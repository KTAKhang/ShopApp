import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserProfileApi, updateUserProfileApi } from '../../services/userService';

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

const initialState = {
    profile: {},
    isLoading: false,
    error: null,
    isUpdateSuccess: false,
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
            });
    },
});

export const { clearUserState, resetUpdateSuccess } = userSlice.actions;
export default userSlice.reducer;
