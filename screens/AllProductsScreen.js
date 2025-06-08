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
    Animated,
    Dimensions,
    TextInput,
    Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAsync, resetAllProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import CategorySection from '../components/CategorySection';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AllProductsScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { allProducts, isLoading, pagination } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category); // Lấy categories từ store
    const [refreshing, setRefreshing] = useState(false);
    const [scrollY] = useState(new Animated.Value(0));
    const [searchText, setSearchText] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
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

    // Filter products based on search text
    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredProducts(allProducts);
            setIsSearching(false);
        } else {
            setIsSearching(true);
            const filtered = allProducts.filter(product =>
                product.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                product.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [searchText, allProducts]);

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
        if (!isLoading && pagination.hasMore && !isSearching) {
            console.log('Loading more products with categoryId:', categoryId); // Debug log
            dispatch(fetchProductsAsync({ 
                page: pagination.currentPage + 1, 
                limit: ITEMS_PER_PAGE,
                isAllProducts: true,
                categoryId
            }));
        }
    };

    const handleSearchPress = () => {
        setIsSearchVisible(true);
    };

    const handleSearchClose = () => {
        setIsSearchVisible(false);
        setSearchText('');
    };

    const clearSearch = () => {
        setSearchText('');
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -10],
        extrapolate: 'clamp',
    });

    const renderSearchModal = () => (
        <Modal
            visible={isSearchVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleSearchClose}
        >
            <View style={styles.searchModalContainer}>
                <View style={styles.searchModalContent}>
                    <View style={styles.searchHeader}>
                        <TouchableOpacity
                            style={styles.searchCloseButton}
                            onPress={handleSearchClose}
                        >
                            <Icon name="arrow-back" size={24} color="#0D364C" />
                        </TouchableOpacity>
                        <Text style={styles.searchTitle}>Search Products</Text>
                    </View>
                    
                    <View style={styles.searchInputContainer}>
                        <Icon name="search" size={20} color="#13C2C2" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by product name..."
                            placeholderTextColor="#A0A0A0"
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus={true}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                <Icon name="clear" size={20} color="#A0A0A0" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {searchText.trim() !== '' && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.searchResultsText}>
                                {filteredProducts.length} results found
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderHeader = () => (
        <Animated.View 
            style={[
                styles.headerContainer,
                {
                    opacity: headerOpacity,
                    transform: [{ translateY: headerTranslateY }]
                }
            ]}
        >
            <LinearGradient
                colors={['#13C2C2', '#0D364C', '#13C2C2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <View style={styles.backButtonInner}>
                            <Icon name="arrow-back" size={22} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            {categoryName || 'All Products'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {isSearching ? filteredProducts.length : allProducts.length} items
                            {isSearching && ` (filtered)`}
                        </Text>
                    </View>
                    
                    <TouchableOpacity
                        style={styles.searchButton}
                        activeOpacity={0.8}
                        onPress={handleSearchPress}
                    >
                        <View style={styles.searchButtonInner}>
                            <Icon name="search" size={22} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>
                
                {/* Decorative elements */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                <View style={styles.decorativeCircle3} />
            </LinearGradient>
        </Animated.View>
    );

    const renderCategorySection = () => {
        // Chỉ hiển thị CategorySection khi không có categoryId cụ thể (tức là đang xem tất cả sản phẩm)
        if (categoryId || isSearching) return null;
        
        return (
            <View style={styles.categorySectionContainer}>
                <CategorySection categories={categories} />
            </View>
        );
    };

    const renderItem = ({ item, index }) => {
        const animatedStyle = {
            opacity: scrollY.interpolate({
                inputRange: [0, 50 * index, 50 * (index + 2)],
                outputRange: [1, 1, 0.3],
                extrapolate: 'clamp',
            }),
            transform: [{
                scale: scrollY.interpolate({
                    inputRange: [0, 50 * index, 50 * (index + 2)],
                    outputRange: [1, 1, 0.95],
                    extrapolate: 'clamp',
                })
            }]
        };

        return (
            <Animated.View style={[styles.productContainer, animatedStyle]}>
                <View style={styles.productCardWrapper}>
                    <ProductCard product={item} />
                </View>
            </Animated.View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || !pagination.hasMore || isSearching) return null;
        return (
            <View style={styles.footerLoader}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#13C2C2" />
                    <Text style={styles.loadingText}>Loading more...</Text>
                </View>
            </View>
        );
    };

    if (isLoading && pagination.currentPage === 1 && allProducts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0D364C" />
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator size="large" color="#13C2C2" />
                        <Text style={styles.loadingMainText}>Loading Products</Text>
                        <Text style={styles.loadingSubText}>Please wait a moment...</Text>
                    </View>
                </View>
                {renderSearchModal()}
            </SafeAreaView>
        );
    }

    console.log('Rendering products:', allProducts.length); // Debug log
    console.log('Filtered products:', filteredProducts.length); // Debug log

    const displayProducts = isSearching ? filteredProducts : allProducts;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D364C" />
            {renderHeader()}
            <View style={styles.content}>
                <Animated.FlatList
                    data={displayProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={renderCategorySection}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <LinearGradient
                                colors={['#f8f9ff', '#e8ecff']}
                                style={styles.emptyGradient}
                            >
                                <View style={styles.emptyIconContainer}>
                                    <Icon name={isSearching ? "search-off" : "inventory-2"} size={80} color="#c7d2fe" />
                                </View>
                                <Text style={styles.emptyTitle}>
                                    {isSearching ? 'No Search Results' : 'No Products Found'}
                                </Text>
                                <Text style={styles.emptyText}>
                                    {isSearching 
                                        ? `No products found matching "${searchText}"`
                                        : categoryId 
                                            ? `No products available in ${categoryName}`
                                            : 'No products available at the moment'
                                    }
                                </Text>
                                {!isSearching && (
                                    <TouchableOpacity style={styles.retryButton} onPress={() => loadProducts(true)}>
                                        <Text style={styles.retryButtonText}>Try Again</Text>
                                    </TouchableOpacity>
                                )}
                            </LinearGradient>
                        </View>
                    }
                />
            </View>
            {renderSearchModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0feff',
    },
    headerContainer: {
        position: 'relative',
        zIndex: 1000,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: StatusBar.currentHeight + 20,
        overflow: 'hidden',
        position: 'relative',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    backButton: {
        padding: 4,
    },
    backButtonInner: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
        fontWeight: '500',
    },
    searchButton: {
        padding: 4,
    },
    searchButtonInner: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -20,
        left: -40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    decorativeCircle3: {
        position: 'absolute',
        top: 20,
        left: width * 0.7,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        flex: 1,
        backgroundColor: '#f0feff',
        marginTop: -25,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
    },
    listContent: {
        padding: 16,
        paddingTop: 30,
    },
    categorySectionContainer: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    productContainer: {
        flex: 1,
        paddingHorizontal: 6,
        paddingVertical: 8,
    },
    productCardWrapper: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#13C2C2',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0feff',
    },
    loadingWrapper: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#13C2C2',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        marginHorizontal: 40,
    },
    loadingMainText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0D364C',
        marginTop: 16,
    },
    loadingSubText: {
        fontSize: 14,
        color: '#13C2C2',
        marginTop: 4,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        shadowColor: '#13C2C2',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#13C2C2',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        marginTop: 60,
        marginHorizontal: 20,
    },
    emptyGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#d1f4f5',
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#13C2C2',
        shadowColor: '#13C2C2',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0D364C',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#13C2C2',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#13C2C2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        shadowColor: '#13C2C2',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Search Modal Styles
    searchModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    searchModalContent: {
        backgroundColor: '#FFFFFF',
        paddingTop: StatusBar.currentHeight + 10,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchCloseButton: {
        padding: 8,
        marginRight: 16,
    },
    searchTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0D364C',
        flex: 1,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#13C2C2',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0D364C',
        paddingVertical: 4,
    },
    clearButton: {
        padding: 4,
    },
    searchResultsContainer: {
        marginTop: 16,
        paddingHorizontal: 4,
    },
    searchResultsText: {
        fontSize: 14,
        color: '#13C2C2',
        fontWeight: '500',
    },
});

export default AllProductsScreen;