import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm tạo đánh giá cho sản phẩm
export async function createProductReview({ product_id, order_detail_id, rating, review_content }) {
    try {
        // Đọc token từ AsyncStorage (nếu cần)
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu POST để tạo đánh giá
        const response = await axios.post(
            'https://your-api-url/product-review/create',
            {
                product_id,
                order_detail_id,
                rating,
                review_content,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to create review');
        }

        return {
            status: 'OK',
            message: 'Review created successfully',
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to create review');
    }
}

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm cập nhật đánh giá cho sản phẩm
export async function updateProductReview({ id, rating, review_content, status }) {
    try {
        // Đọc token từ AsyncStorage (nếu cần)
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu PUT để cập nhật đánh giá
        const response = await axios.put(
            `https://your-api-url/product-review/update/${id}`,
            {
                rating,
                review_content,
                status,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to update review');
        }

        return {
            status: 'OK',
            message: 'Review updated successfully',
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to update review');
    }
}


// Hàm lấy tất cả đánh giá đã được duyệt của sản phẩm
export async function getProductReviewsByUser(product_id) {
    try {
        // Kiểm tra xem product_id có hợp lệ không
        if (!product_id) {
            throw new Error('Product ID is required');
        }

        // Đọc token từ AsyncStorage (nếu cần dùng xác thực)
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu GET để lấy danh sách đánh giá đã được duyệt của sản phẩm
        const response = await axios.get(
            `https://your-api-url/product-review/user?product_id=${product_id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch reviews');
        }

        return data; // Trả về danh sách đánh giá hoặc thông báo lỗi
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews');
    }
}

// Hàm lấy tất cả đánh giá đã được duyệt của sản phẩm
export async function getAllProductReviews(product_id) {
    try {
        // Kiểm tra xem product_id có hợp lệ không
        if (!product_id) {
            throw new Error('Product ID is required');
        }

        // Đọc token từ AsyncStorage (nếu cần dùng xác thực)
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu GET để lấy tất cả đánh giá đã được duyệt của sản phẩm
        const response = await axios.get(
            `https://your-api-url/product-review/product/${product_id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch reviews');
        }

        return data; // Trả về danh sách đánh giá hoặc thông báo lỗi
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews');
    }
}



// Hàm lấy toàn bộ đánh giá (chỉ dành cho admin)
export async function getAllReviews() {
    try {
        // Đọc token từ AsyncStorage để xác thực người dùng
        const token = await AsyncStorage.getItem('token');

        // Kiểm tra xem token có hợp lệ không
        if (!token) {
            throw new Error('You need to be logged in to access this resource');
        }

        // Gửi yêu cầu GET để lấy toàn bộ đánh giá (chỉ dành cho admin)
        const response = await axios.get(
            'https://your-api-url/product-review/all',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch reviews');
        }

        return data; // Trả về danh sách đánh giá hoặc thông báo lỗi
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews');
    }
}
