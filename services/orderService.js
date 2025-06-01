import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getOrderByUserApi() {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await axios.get('https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/order', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = response.data;

        if (!data.success) {
            throw new Error(data.message || 'Lỗi lấy danh sách đơn hàng');
        }

        return data.data;
    } catch (error) {
        console.error('getOrderByUserApi error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi lấy đơn hàng');
    }
}
