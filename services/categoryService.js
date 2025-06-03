import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm tạo danh mục mới
export async function createCategory({ name, image }) {
    try {
        // Đọc token từ AsyncStorage để sử dụng cho xác thực (nếu cần)
        const token = await AsyncStorage.getItem('token');

        // Tạo form data để gửi image (với kiểu multipart/form-data)
        const formData = new FormData();
        formData.append('name', name);

        if (image) {
            formData.append('image', {
                uri: image.uri,
                type: image.type, // Ví dụ: image/jpeg
                name: image.fileName, // Tên file (có thể lấy từ đối tượng image)
            });
        }

        // Gửi request tạo danh mục
        const response = await axios.post(
            'https://your-api-url/category/create',
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
            throw new Error(data.message || 'Failed to create category');
        }

        return {
            status: 'OK',
            message: 'Category created successfully',
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to create category');
    }
}
// Hàm tạo danh mục mới
export async function createCategory({ name, image }) {
    try {
        // Đọc token từ AsyncStorage để sử dụng cho xác thực (nếu cần)
        const token = await AsyncStorage.getItem('token');

        // Tạo form data để gửi image (với kiểu multipart/form-data)
        const formData = new FormData();
        formData.append('name', name);

        if (image) {
            formData.append('image', {
                uri: image.uri,
                type: image.type, // Ví dụ: image/jpeg
                name: image.fileName, // Tên file (có thể lấy từ đối tượng image)
            });
        }

        // Gửi request tạo danh mục
        const response = await axios.post(
            'https://your-api-url/category/create',
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
            throw new Error(data.message || 'Failed to create category');
        }

        return {
            status: 'OK',
            message: 'Category created successfully',
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to create category');
    }
}

// Hàm cập nhật danh mục
export async function updateCategory({ id, name, status, image }) {
    try {
        // Đọc token từ AsyncStorage để sử dụng cho xác thực (nếu cần)
        const token = await AsyncStorage.getItem('token');

        // Tạo form data để gửi thông tin danh mục và hình ảnh (multipart/form-data)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('status', status); // Trạng thái (boolean)

        if (image) {
            formData.append('image', {
                uri: image.uri,
                type: image.type, // Ví dụ: image/jpeg
                name: image.fileName, // Tên file (có thể lấy từ đối tượng image)
            });
        }

        // Gửi request cập nhật danh mục
        const response = await axios.put(
            `https://your-api-url/category/update/${id}`,
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
            throw new Error(data.message || 'Failed to update category');
        }

        return {
            status: 'OK',
            message: 'Category updated successfully',
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to update category');
    }
}

// Hàm lấy tất cả danh mục với phân trang
export async function getCategories({ page = 1, limit = 10 }) {
    try {
        // Đọc token từ AsyncStorage (nếu cần dùng xác thực)
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu GET với các tham số phân trang
        const response = await axios.get(
            `https://your-api-url/category?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch categories');
        }

        return data; // Trả về danh sách danh mục hoặc thông tin lỗi
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
    }
}



// Hàm lấy danh mục theo ID
export async function getCategoryById(id) {
    try {
        // Kiểm tra xem ID có hợp lệ không
        if (!id) {
            throw new Error('Category ID is required');
        }

        // Đọc token từ AsyncStorage (nếu cần dùng xác thực)
        const token = await AsyncStorage.getItem('token');

        // Gửi yêu cầu GET với ID danh mục
        const response = await axios.get(
            `https://your-api-url/category/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to fetch category');
        }

        return data; // Trả về thông tin danh mục hoặc thông báo lỗi
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch category');
    }
}
