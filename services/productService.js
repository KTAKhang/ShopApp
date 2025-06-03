import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm tạo sản phẩm mới
export async function createProduct({
    name,
    category_id,
    price,
    short_desc,
    detail_desc,
    quantity,
    sold,
    factory,
    target,
    image,
}) {
    try {
        // Đọc token từ AsyncStorage để sử dụng cho xác thực (nếu cần)
        const token = await AsyncStorage.getItem('token');

        // Tạo form data để gửi thông tin sản phẩm và hình ảnh (multipart/form-data)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category_id', category_id);
        formData.append('price', price);
        formData.append('short_desc', short_desc);
        formData.append('detail_desc', detail_desc);
        formData.append('quantity', quantity);
        formData.append('sold', sold);
        formData.append('factory', factory);
        formData.append('target', target);

        if (image) {
            formData.append('image', {
                uri: image.uri,
                type: image.type, // Ví dụ: image/jpeg
                name: image.fileName, // Tên file (có thể lấy từ đối tượng image)
            });
        }

        // Gửi yêu cầu tạo sản phẩm mới
        const response = await axios.post(
            'https://your-api-url/product/create',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to create product');
        }

        return {
            status: 'OK',
            message: 'Product created successfully',
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to create product');
    }
}

// Hàm cập nhật sản phẩm
export async function updateProduct({
    id,
    name,
    category_id,
    price,
    short_desc,
    detail_desc,
    quantity,
    sold,
    factory,
    target,
    status,
    image,
}) {
    try {
        // Đọc token từ AsyncStorage để sử dụng cho xác thực (nếu cần)
        const token = await AsyncStorage.getItem('token');

        // Tạo form data để gửi thông tin sản phẩm và hình ảnh (multipart/form-data)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category_id', category_id);
        formData.append('price', price);
        formData.append('short_desc', short_desc);
        formData.append('detail_desc', detail_desc);
        formData.append('quantity', quantity);
        formData.append('sold', sold);
        formData.append('factory', factory);
        formData.append('target', target);
        formData.append('status', status);

        if (image) {
            formData.append('image', {
                uri: image.uri,
                type: image.type, // Ví dụ: image/jpeg
                name: image.fileName, // Tên file (có thể lấy từ đối tượng image)
            });
        }

        // Gửi yêu cầu cập nhật sản phẩm
        const response = await axios.put(
            `https://your-api-url/product/update/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to update product');
        }

        return {
            status: 'OK',
            message: 'Product updated successfully',
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to update product');
    }
}


// Hàm lấy danh sách sản phẩm với phân trang
export async function getProducts({ page = 1, limit = 10 }) {
    try {
        // Đọc token từ AsyncStorage nếu cần xác thực
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu GET với các tham số phân trang
        const response = await axios.get(
            `https://your-api-url/product?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch products');
        }

        return data; // Trả về danh sách sản phẩm hoặc thông báo lỗi
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch products');
    }
}


// Hàm lấy thông tin sản phẩm theo ID
export async function getProductById(id) {
    try {
        // Kiểm tra xem ID có hợp lệ không
        if (!id) {
            throw new Error('Product ID is required');
        }

        // Đọc token từ AsyncStorage (nếu cần dùng xác thực)
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu GET với ID sản phẩm
        const response = await axios.get(
            `https://your-api-url/product/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch product');
        }

        return data; // Trả về thông tin sản phẩm hoặc thông báo lỗi
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product');
    }
}

