import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm lấy danh sách sản phẩm với phân trang và lọc theo category
export async function getProducts({ page = 1, limit = 10, categoryId = null }) {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        let url = `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/product?page=${page}&limit=${limit}`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }

        console.log('Fetching products with URL:', url); // Debug log

        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('API Response:', response.data); // Debug log

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch products');
        }

        return data; // Trả về toàn bộ response data

    } catch (error) {
        console.error('getProducts error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch products');
    }
}

// Hàm lấy thông tin sản phẩm theo ID
export async function getProductById(id) {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        console.log('Fetching product with ID:', id); // Debug log

        const response = await axios.get(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/product/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log('Product API response:', response.data); // Debug log

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch product');
        }

        return data.data; // Trả về thông tin sản phẩm

    } catch (error) {
        console.error('getProductById API error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product');
    }
}