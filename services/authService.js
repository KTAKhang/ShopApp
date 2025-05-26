import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm đăng nhập
export async function loginApi({ email, password }) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/user/sign-in',
            { email, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Login failed');
        }

        return {
            user: data.data,
            token: data.token.access_token,
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
}

// ✅ Hàm gửi OTP
export async function sendOtpApi({ user_name, email, password }) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/auth/register/send-otp',
            { user_name, email, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Send OTP failed');
        }

        return data; // { status: 'OK', message: 'OTP sent to email' }
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Send OTP failed');
    }
}

export async function confirmOtpApi(otp) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/auth/register/confirm',
            { otp },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Confirm OTP failed');
        }

        return data; // { status: 'OK', message: 'Register successfully' }
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Confirm OTP failed');
    }
}

// Hàm gọi API với token từ AsyncStorage
export async function apiCall(url, options = {}) {
    try {
        const token = await AsyncStorage.getItem('token');

        const config = {
            method: options.method || 'GET',
            url,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...(options.data && { data: options.data }),
            ...(options.params && { params: options.params }),
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'API call failed');
    }
}
