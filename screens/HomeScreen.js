import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TopNavBar from '../components/TopNavBar';
import SearchBar from '../components/SearchBar';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import BottomNavigation from '../components/BottomNavigation';
import { fetchCategoriesAsync } from '../store/slices/categorySlice';
import { fetchProductsAsync } from '../store/slices/productSlice';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
    const dispatch = useDispatch();
    const { isLoading: isCategoryLoading, categories } = useSelector((state) => state.category);
    const { isLoading: isProductLoading, products } = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(fetchCategoriesAsync({ page: 1, limit: 20 }));
        dispatch(fetchProductsAsync({ page: 1, limit: 10 }));
    }, [dispatch]);

    const isLoading = isCategoryLoading || isProductLoading;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.secondary}
                translucent
            />
            <LinearGradient
                colors={COLORS.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <TopNavBar />
                <SearchBar />
            </LinearGradient>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                    <CategorySection categories={categories} />
                    <FeaturedProducts products={products} title="New Arrivals" />
                    <FeaturedProducts products={products} title="Popular Products" />
                </View>
            </ScrollView>
            <BottomNavigation />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerGradient: {
        paddingTop: StatusBar.currentHeight + 10,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    scrollView: {
        flex: 1,
        marginTop: -20,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    content: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
        marginHorizontal: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
});

export default HomeScreen;