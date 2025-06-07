import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAsync, resetAllProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const AllProductsScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { allProducts, isLoading, pagination } = useSelector((state) => state.product);
    const [refreshing, setRefreshing] = useState(false);
    const ITEMS_PER_PAGE = 10;

    // Get category info from route params
    const categoryId = route.params?.categoryId;
    const categoryName = route.params?.categoryName;

    console.log('Route params:', route.params); // Debug log
    console.log('Category ID:', categoryId); // Debug log
    console.log('Category Name:', categoryName); // Debug log

    useEffect(() => {
        console.log('Loading products with categoryId:', categoryId); // Debug log
        loadProducts();
        return () => {
            dispatch(resetAllProducts());
        };
    }, [categoryId]);

    const loadProducts = (refresh = false) => {
        const pageToLoad = refresh ? 1 : pagination.currentPage;
        console.log('Loading page:', pageToLoad, 'with categoryId:', categoryId); // Debug log
        
        dispatch(fetchProductsAsync({ 
            page: pageToLoad, 
            limit: ITEMS_PER_PAGE,
            isAllProducts: true,
            categoryId 
        }));
    };

    const handleRefresh = () => {
        setRefreshing(true);
        dispatch(resetAllProducts());
        loadProducts(true);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (!isLoading && pagination.hasMore) {
            console.log('Loading more products with categoryId:', categoryId); // Debug log
            dispatch(fetchProductsAsync({ 
                page: pagination.currentPage + 1, 
                limit: ITEMS_PER_PAGE,
                isAllProducts: true,
                categoryId
            }));
        }
    };

    const renderHeader = () => (
        <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
        >
            <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
                {categoryName || 'All Products'}
            </Text>
            <View style={styles.headerButton} />
        </LinearGradient>
    );

    const renderItem = ({ item }) => (
        <View style={styles.productContainer}>
            <ProductCard product={item} />
        </View>
    );

    const renderFooter = () => {
        if (!isLoading || !pagination.hasMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    if (isLoading && pagination.currentPage === 1 && allProducts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    console.log('Rendering products:', allProducts.length); // Debug log

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
            {renderHeader()}
            <View style={styles.content}>
                <FlatList
                    data={allProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="inbox" size={64} color={COLORS.text.secondary} />
                            <Text style={styles.emptyText}>
                                {categoryId 
                                    ? `No products available in ${categoryName}`
                                    : 'No products available'
                                }
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: StatusBar.currentHeight + 16,
        elevation: 5,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.white,
    },
    content: {
        flex: 1,
        backgroundColor: COLORS.background,
        marginTop: -20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    listContent: {
        padding: 16,
        paddingTop: 36,
    },
    productContainer: {
        flex: 1,
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginTop: 16,
    },
});

export default AllProductsScreen; 