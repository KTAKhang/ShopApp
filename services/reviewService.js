// reviewService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/product-review';

export async function createReviewApi({ product_id, order_detail_id, rating, review_content }) {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await axios.post(
            `${BASE_URL}/create`,
            {
                product_id,
                order_detail_id,
                rating,
                review_content,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (!data.success) {
            throw new Error(data.message || 'Lỗi đánh giá sản phẩm');
        }

        return data; // { success, message, review }
    } catch (error) {
        console.error('createReviewApi error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi đánh giá sản phẩm');
    }
}
