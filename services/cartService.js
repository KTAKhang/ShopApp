// cartService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getCartByUserApi() {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await axios.get('https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/cart', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Lỗi lấy giỏ hàng');
        }

        return data.data;
    } catch (error) {
        console.error('getCartByUserApi error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi lấy giỏ hàng');
    }
}

export async function updateCartApi({ product_id, quantity }) {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await axios.put(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/cart/update',
            { product_id, quantity },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (response.status !== 200) {
            throw new Error(data.message || 'Lỗi cập nhật giỏ hàng');
        }

        return data;
    } catch (error) {
        console.error('updateCartApi error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi cập nhật giỏ hàng');
    }
}

export async function removeFromCartApi(product_id) {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await axios.delete(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/cart/remove/${product_id}`,
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (response.status !== 200) {
            throw new Error(data.message || 'Lỗi xóa sản phẩm khỏi giỏ hàng');
        }

        return data; // { message, sum, total_items }
    } catch (error) {
        console.error('removeFromCartApi error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi xóa sản phẩm khỏi giỏ hàng');
    }
}