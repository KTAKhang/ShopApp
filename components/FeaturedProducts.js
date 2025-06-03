import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAsync } from '../store/slices/productSlice';  // Đảm bảo đường dẫn đúng
import ProductCard from './ProductCard';

const FeaturedProducts = () => {
    const dispatch = useDispatch();
    const { products, isLoading, error } = useSelector((state) => state.product);  // Lấy dữ liệu sản phẩm từ Redux

    useEffect(() => {
        dispatch(fetchProductsAsync({ page: 1, limit: 10 }));
    }, [dispatch]);

    // Log Redux state để kiểm tra categories
    console.log('Products from Redux state:', products);

    if (isLoading) {
        return <ActivityIndicator size="large" color="#13C2C2" style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.errorText}>Failed to load products. Please try again.</Text>;
    }

    // Nếu không có sản phẩm trong Redux store
    if (!products || products.length === 0) {
        return <Text style={styles.errorText}>No products available.</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Featured Products</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {products.map((product) => (
                    <View key={product._id} style={styles.productWrapper}>
                        <ProductCard product={product} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4F46E5',
    },
    scrollContent: {
        paddingRight: 16,
    },
    productWrapper: {
        width: 160,
        marginRight: 12,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default FeaturedProducts;
