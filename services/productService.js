import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm lấy danh sách sản phẩm với phân trang và tìm kiếm
export async function getProducts({ page = 1, limit = 10, search = null, category_name = null }) {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        let url = `https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/product?page=${page}&limit=${limit}`;

        if (search && search.trim() !== '') {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }

        if (category_name && category_name.trim() !== '') {
            url += `&category_name=${encodeURIComponent(category_name.trim())}`;
        }

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

// Hàm tìm kiếm sản phẩm theo tên (wrapper cho getProducts)
export async function searchProducts({ search, page = 1, limit = 10 }) {
    return getProducts({ page, limit, search });
}

// Hàm lấy sản phẩm theo category (using search instead of category_name parameter)
export async function getProductsByCategory({ category_name, page = 1, limit = 10 }) {
    try {
        // Get all products and filter client-side (most reliable approach)
        const allProductsResponse = await getProducts({ page: 1, limit: 100 });
        const allProducts = allProductsResponse.data.products;

        // Improved client-side filtering
        const normalizeString = (str) => {
            if (!str) return '';
            return str.toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .normalize('NFD') // Normalize Vietnamese characters
                .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
        };

        const targetCategory = normalizeString(category_name);

        const filteredProducts = allProducts.filter(product => {
            const productCategory = normalizeString(product.category_name);
            return productCategory.includes(targetCategory) || targetCategory.includes(productCategory);
        });

        // Use client-side filtered results
        const result = {
            ...allProductsResponse,
            data: {
                ...allProductsResponse.data,
                products: filteredProducts,
                total: {
                    ...allProductsResponse.data.total,
                    totalProduct: filteredProducts.length,
                    currentPage: 1,
                    totalPage: 1
                }
            }
        };

        return result;

    } catch (error) {
        console.error('getProductsByCategory error:', error);
        throw error;
    }
}