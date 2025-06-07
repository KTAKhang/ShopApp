import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TopNavBar from '../components/TopNavBar';
import SearchBar from '../components/SearchBar';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import BottomNavigation from '../components/BottomNavigation';
import { fetchCategoriesAsync } from '../store/slices/categorySlice';
import { fetchProductsAsync } from '../store/slices/productSlice';

const HomeScreen = () => {
    const dispatch = useDispatch();
    const { isLoading: isCategoryLoading, categories } = useSelector((state) => state.category);
    const { isLoading: isProductLoading, products } = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(fetchCategoriesAsync({ page: 1, limit: 10 }));
        dispatch(fetchProductsAsync({ page: 1, limit: 10 }));
    }, [dispatch]);

    const isLoading = isCategoryLoading || isProductLoading;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#13C2C2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TopNavBar />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <SearchBar />
                <CategorySection categories={categories} />
                <FeaturedProducts products={products} />
                <FeaturedProducts products={products} />
            </ScrollView>
            <BottomNavigation />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});

export default HomeScreen;