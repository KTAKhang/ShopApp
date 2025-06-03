import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getUserProfileApi() {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await axios.get('https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/user', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = response.data;


        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch user info');
        }

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user info');
    }
}

export async function updateUserProfileApi({ user_name, avatar }) {
    try {
        const token = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');
        if (!token || !userJson) throw new Error('Missing token or user info');

        const user = JSON.parse(userJson);
        const userId = user._id;

        const formData = new FormData();
        if (user_name) formData.append('user_name', user_name);
        if (avatar) {
            formData.append('avatar', {
                uri: avatar,
                name: 'avatar.jpg', // hoặc lấy từ path
                type: 'image/jpeg',  // hoặc image/png nếu cần
            });
        }

        const response = await axios.put(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/user/update-user/${userId}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
            }
        );

        const data = response.data;
        if (data.status !== 'OK') {
            throw new Error(data.message || 'Update failed');
        }

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Update failed');
    }
}

// Hàm lấy danh sách người dùng với phân trang (chỉ dành cho admin)
export async function getAllUsers({ page = 1, limit = 10 }) {
    try {
        // Đọc token từ AsyncStorage để xác thực quyền admin
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error('You need to be logged in to access this resource');
        }

        // Gửi yêu cầu GET để lấy danh sách người dùng với phân trang
        const response = await axios.get(
            `https://your-api-url/api/user?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch users');
        }

        return data.data; // Trả về danh sách người dùng và thông tin phân trang
    } catch (error) {
        console.error('getAllUsers error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
    }
}

// Hàm lấy thông tin cá nhân của người dùng theo ID (dành cho admin)
export async function getUserById(id) {
    try {
        // Kiểm tra xem ID có hợp lệ không
        if (!id) {
            throw new Error('User ID is required');
        }

        // Lấy token từ AsyncStorage để xác thực quyền admin
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error('You need to be logged in to access this resource');
        }

        // Gửi yêu cầu GET để lấy thông tin người dùng theo ID
        const response = await axios.get(
            `https://your-api-url/api/user/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch user');
        }

        return data.data; // Trả về thông tin người dùng hoặc thông báo lỗi
    } catch (error) {
        console.error('getUserById error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user');
    }
}