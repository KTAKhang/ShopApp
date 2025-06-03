import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm thêm sản phẩm vào giỏ hàng
export async function addProductToCart({ product_id, quantity }) {
    try {
        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để thêm sản phẩm vào giỏ hàng');
        }

        // Gửi yêu cầu POST để thêm sản phẩm vào giỏ hàng
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/cart/add',
            {
                product_id,
                quantity,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng');
        }

        return {
            status: 'OK',
            message: 'Sản phẩm đã được thêm vào giỏ hàng thành công',
        };
    } catch (error) {
        console.error('addProductToCart error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi thêm sản phẩm vào giỏ hàng');
    }
}

// Hàm cập nhật số lượng sản phẩm trong giỏ hàng
export async function updateProductQuantityInCart({ product_id, quantity }) {
    try {
        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để cập nhật số lượng sản phẩm');
        }

        // Gửi yêu cầu PUT để cập nhật số lượng sản phẩm trong giỏ hàng
        const response = await axios.put(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/cart/update',
            {
                product_id,
                quantity,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Lỗi khi cập nhật số lượng sản phẩm trong giỏ hàng');
        }

        return {
            status: 'OK',
            message: 'Số lượng sản phẩm trong giỏ hàng đã được cập nhật thành công',
        };
    } catch (error) {
        console.error('updateProductQuantityInCart error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi cập nhật số lượng sản phẩm trong giỏ hàng');
    }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
export async function removeProductFromCart(product_id) {
    try {
        // Kiểm tra xem product_id có hợp lệ không
        if (!product_id) {
            throw new Error('Product ID is required');
        }

        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để xóa sản phẩm khỏi giỏ hàng');
        }

        // Gửi yêu cầu DELETE để xóa sản phẩm khỏi giỏ hàng
        const response = await axios.delete(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/cart/remove/${product_id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng');
        }

        return {
            status: 'OK',
            message: 'Sản phẩm đã được xóa khỏi giỏ hàng thành công',
        };
    } catch (error) {
        console.error('removeProductFromCart error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi xóa sản phẩm khỏi giỏ hàng');
    }
}

// Hàm lấy toàn bộ sản phẩm trong giỏ hàng của người dùng
export async function getCartItems() {
    try {
        // Lấy token từ AsyncStorage để xác thực người dùng
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để xem giỏ hàng');
        }

        // Gửi yêu cầu GET để lấy toàn bộ sản phẩm trong giỏ hàng
        const response = await axios.get(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/cart',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Lỗi khi lấy giỏ hàng');
        }

        return data.data; // Trả về danh sách sản phẩm trong giỏ hàng
    } catch (error) {
        console.error('getCartItems error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi lấy giỏ hàng');
    }
}
