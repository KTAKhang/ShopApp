import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm lấy danh sách sản phẩm với phân trang và tìm kiếm
export async function getProducts({ page = 1, limit = 10, search = null }) {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        let url = `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/product?page=${page}&limit=${limit}`;
        if (search && search.trim() !== '') {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }

        // Luôn filter chỉ lấy sản phẩm có status = true (active products)
        url += `&status=true`;



        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });



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



        const response = await axios.get(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/product/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );



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