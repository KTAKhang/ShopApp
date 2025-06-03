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

// Hàm tạo đơn hàng mới
export async function createOrder({ selected_product_ids, receiverInfo }) {
    try {
        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        // Kiểm tra nếu không có token
        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để tạo đơn hàng');
        }

        // Gửi yêu cầu POST để tạo đơn hàng mới
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/order/create',
            {
                selected_product_ids,
                receiverInfo,
            },
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.success !== true) {
            throw new Error(data.message || 'Lỗi tạo đơn hàng');
        }

        return {
            status: 'OK',
            message: 'Đơn hàng đã được tạo thành công',
        };
    } catch (error) {
        console.error('createOrder error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi tạo đơn hàng');
    }
}

// Hàm cập nhật đơn hàng
export async function updateOrder({ id, updateData }) {
    try {
        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        // Kiểm tra nếu không có token
        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để cập nhật đơn hàng');
        }

        // Gửi yêu cầu PUT để cập nhật đơn hàng
        const response = await axios.put(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/order/update/${id}`,
            updateData,  // Dữ liệu cần cập nhật (updateData)
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.success !== true) {
            throw new Error(data.message || 'Lỗi cập nhật đơn hàng');
        }

        return {
            status: 'OK',
            message: 'Đơn hàng đã được cập nhật thành công',
        };
    } catch (error) {
        console.error('updateOrder error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi cập nhật đơn hàng');
    }
}

// Hàm hủy đơn hàng
export async function cancelOrder(id) {
    try {
        // Kiểm tra xem ID có hợp lệ không
        if (!id) {
            throw new Error('Order ID is required');
        }

        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        // Kiểm tra nếu không có token
        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để hủy đơn hàng');
        }

        // Gửi yêu cầu PUT để hủy đơn hàng
        const response = await axios.put(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/order/cancel/${id}`,
            {},
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.success !== true) {
            throw new Error(data.message || 'Lỗi khi hủy đơn hàng');
        }

        return {
            status: 'OK',
            message: 'Đơn hàng đã được hủy thành công',
        };
    } catch (error) {
        console.error('cancelOrder error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi hủy đơn hàng');
    }
}

// Hàm lấy chi tiết đơn hàng theo ID
export async function getOrderDetailsById(id) {
    try {
        // Kiểm tra xem ID có hợp lệ không
        if (!id) {
            throw new Error('Order ID is required');
        }

        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        // Kiểm tra nếu không có token
        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để xem chi tiết đơn hàng');
        }

        // Gửi yêu cầu GET để lấy chi tiết đơn hàng theo ID
        const response = await axios.get(
            `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/order/${id}`,
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.success !== true) {
            throw new Error(data.message || 'Lỗi khi lấy chi tiết đơn hàng');
        }

        return data.data; // Trả về chi tiết đơn hàng hoặc thông báo lỗi
    } catch (error) {
        console.error('getOrderDetailsById error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi lấy chi tiết đơn hàng');
    }
}