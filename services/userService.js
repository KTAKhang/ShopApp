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