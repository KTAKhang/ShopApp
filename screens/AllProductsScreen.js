// Import các thư viện React Native và Redux cần thiết
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// Import các action từ Redux slice để quản lý sản phẩm
import { fetchProductsAsync, fetchProductsByCategoryAsync, resetAllProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import CategorySection from '../components/CategorySection';
// Import các component loading tùy chỉnh
import { InlineLoading, FooterLoading } from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

// Lấy kích thước màn hình thiết bị
const { width, height } = Dimensions.get('window');

/**
 * Component AllProductsScreen - Màn hình hiển thị tất cả sản phẩm
 * Hỗ trợ tìm kiếm, lọc theo danh mục, phân trang
 */
const AllProductsScreen = ({ navigation, route }) => {
    // Khởi tạo dispatch để gọi Redux actions
    const dispatch = useDispatch();
    
    // Lấy dữ liệu từ Redux store
    const { allProducts, isLoading, pagination } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category); // Lấy categories từ store
    
    // Khai báo các state local
    const [refreshing, setRefreshing] = useState(false); // Trạng thái pull-to-refresh
    const [searchText, setSearchText] = useState(''); // Text trong ô tìm kiếm
    const [isSearchVisible, setIsSearchVisible] = useState(false); // Hiển thị modal tìm kiếm
    const [currentSearch, setCurrentSearch] = useState(''); // Track current search term for API
    const ITEMS_PER_PAGE = 6; // Số sản phẩm hiển thị mỗi trang

    // Lấy thông tin danh mục từ route params (chỉ để hiển thị)
    const categoryName = route.params?.categoryName;

    /**
     * Effect hook để fetch dữ liệu khi component mount hoặc categoryName thay đổi
     */
    useEffect(() => {
        if (categoryName) {
            // Nếu navigate với categoryName, fetch sản phẩm theo danh mục
            dispatch(fetchProductsByCategoryAsync({
                category_name: categoryName,
                page: 1,
                limit: ITEMS_PER_PAGE
            }));
        } else {
            // Ngược lại, fetch tất cả sản phẩm
            dispatch(fetchProductsAsync({
                page: 1,
                limit: ITEMS_PER_PAGE,
                isAllProducts: true,
                search: null
            }));
        }
        
        // Cleanup function - reset products khi component unmount
        return () => {
            dispatch(resetAllProducts());
        };
    }, [dispatch, categoryName]);

    /**
     * Xử lý pull-to-refresh
     * Làm mới danh sách sản phẩm về trang đầu tiên
     */
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        dispatch(resetAllProducts());

        if (categoryName) {
            // Refresh sản phẩm theo danh mục
            dispatch(fetchProductsByCategoryAsync({
                category_name: categoryName,
                page: 1,
                limit: ITEMS_PER_PAGE
            }));
        } else {
            // Refresh tất cả sản phẩm hoặc kết quả tìm kiếm
            dispatch(fetchProductsAsync({
                page: 1,
                limit: ITEMS_PER_PAGE,
                isAllProducts: true,
                search: currentSearch
            }));
        }
        setRefreshing(false);
    }, [dispatch, currentSearch, categoryName]);

    /**
     * Xử lý load more khi cuộn đến cuối danh sách
     * Tự động tải thêm sản phẩm từ trang tiếp theo
     */
    const handleLoadMore = useCallback(() => {
        // Điều kiện để tránh loading không cần thiết
        if (!isLoading && pagination.hasMore && allProducts.length >= ITEMS_PER_PAGE) {
            const pageToLoad = pagination.currentPage + 1;

            if (categoryName && !currentSearch) {
                // Load thêm sản phẩm theo danh mục
                dispatch(fetchProductsByCategoryAsync({
                    category_name: categoryName,
                    page: pageToLoad,
                    limit: ITEMS_PER_PAGE
                }));
            } else {
                // Load thêm tất cả sản phẩm hoặc kết quả tìm kiếm
                dispatch(fetchProductsAsync({
                    page: pageToLoad,
                    limit: ITEMS_PER_PAGE,
                    isAllProducts: true,
                    search: currentSearch
                }));
            }
        }
    }, [isLoading, pagination.hasMore, pagination.currentPage, currentSearch, categoryName, dispatch, allProducts.length]);

    /**
     * Mở modal tìm kiếm
     */
    const handleSearchPress = () => {
        setSearchText(currentSearch || ''); // Set current search khi mở modal
        setIsSearchVisible(true);
    };

    /**
     * Đóng modal tìm kiếm
     */
    const handleSearchClose = () => {
        setIsSearchVisible(false);
        // Reset searchText về currentSearch khi đóng modal
        setSearchText(currentSearch || '');
    };

    /**
     * Thực hiện tìm kiếm sản phẩm
     * Chỉ gọi API khi search term thay đổi
     */
    const handleSearch = () => {
        if (searchText.trim() !== currentSearch) {
            setCurrentSearch(searchText.trim());
            const searchToUse = searchText.trim() || null;
            dispatch(resetAllProducts());
            setIsSearchVisible(false); // Đóng modal trước khi bắt đầu tìm kiếm
            dispatch(fetchProductsAsync({
                page: 1,
                limit: ITEMS_PER_PAGE,
                isAllProducts: true,
                search: searchToUse
            }));
        } else {
            setIsSearchVisible(false); // Đóng modal nếu search term giống nhau
        }
    };

    /**
     * Xóa từ khóa tìm kiếm và quay về danh sách gốc
     */
    const clearSearch = () => {
        setSearchText('');
        if (currentSearch !== '') {
            setCurrentSearch('');
            dispatch(resetAllProducts());

            if (categoryName) {
                // Quay về lọc theo danh mục
                dispatch(fetchProductsByCategoryAsync({
                    category_name: categoryName,
                    page: 1,
                    limit: ITEMS_PER_PAGE
                }));
            } else {
                // Quay về tất cả sản phẩm
                dispatch(fetchProductsAsync({
                    page: 1,
                    limit: ITEMS_PER_PAGE,
                    isAllProducts: true,
                    search: null
                }));
            }
        }
    };

    /**
     * Render modal tìm kiếm
     * Hiển thị giao diện tìm kiếm dạng overlay
     */
    const renderSearchModal = () => (
        <Modal
            visible={isSearchVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleSearchClose}
        >
            <View style={styles.searchModalContainer}>
                <View style={styles.searchModalContent}>
                    {/* Header của modal tìm kiếm */}
                    <View style={styles.searchHeader}>
                        <TouchableOpacity
                            style={styles.searchCloseButton}
                            onPress={handleSearchClose}
                        >
                            <Icon name="arrow-back" size={24} color="#0D364C" />
                        </TouchableOpacity>
                        <Text style={styles.searchTitle}>Tìm kiếm sản phẩm</Text>
                    </View>

                    {/* Input tìm kiếm */}
                    <View style={styles.searchInputContainer}>
                        <Icon name="search" size={20} color="#13C2C2" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm theo tên sản phẩm..."
                            placeholderTextColor="#A0A0A0"
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus={true}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {/* Nút xóa text nếu có nội dung */}
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                <Icon name="clear" size={20} color="#A0A0A0" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Các nút hành động */}
                    <View style={styles.searchButtonContainer}>
                        {/* Nút tìm kiếm */}
                        <TouchableOpacity
                            style={[
                                styles.searchActionButton,
                                searchText.trim() === '' && styles.searchActionButtonDisabled
                            ]}
                            onPress={handleSearch}
                            disabled={searchText.trim() === ''}
                        >
                            <Icon name="search" size={20} color="#fff" />
                            <Text style={styles.searchActionButtonText}>Tìm kiếm</Text>
                        </TouchableOpacity>

                        {/* Nút xóa tất cả (hiển thị khi đang có search) */}
                        {currentSearch && (
                            <TouchableOpacity
                                style={styles.clearAllButton}
                                onPress={() => {
                                    clearSearch();
                                    setIsSearchVisible(false);
                                }}
                            >
                                <Icon name="clear-all" size={20} color="#6b7280" />
                                <Text style={styles.clearAllButtonText}>Xóa tất cả</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Hiển thị thông tin tìm kiếm hiện tại */}
                    {currentSearch && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.searchResultsText}>
                                Tìm kiếm hiện tại: "{currentSearch}"
                            </Text>
                            <Text style={styles.searchResultsSubText}>
                                Tìm thấy {allProducts.length} sản phẩm
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    /**
     * Render header của màn hình
     * Bao gồm nút back, tiêu đề, và nút tìm kiếm
     */
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <LinearGradient
                colors={['#13C2C2', '#0D364C', '#13C2C2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    {/* Nút quay lại */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <View style={styles.backButtonInner}>
                            <Icon name="arrow-back" size={22} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    {/* Tiêu đề và thông tin số lượng sản phẩm */}
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            {currentSearch ? 'Kết quả tìm kiếm' : (categoryName || 'Tất cả sản phẩm')}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {allProducts.length} sản phẩm
                            {currentSearch ? ` cho "${currentSearch}"` : ''}
                        </Text>
                    </View>

                    {/* Nút mở modal tìm kiếm */}
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

                {/* Các element trang trí */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                <View style={styles.decorativeCircle3} />
            </LinearGradient>
        </View>
    );

    /**
     * Render section danh mục
     * Chỉ hiển thị khi không có search term và không có category cụ thể
     */
    const renderCategorySection = () => {
        // Chỉ hiển thị CategorySection khi không có search term và không có category cụ thể
        if (currentSearch || categoryName) return null;

        return (
            <View style={styles.categorySectionContainer}>
                <CategorySection categories={categories} />
            </View>
        );
    };

    /**
     * Render từng item sản phẩm trong FlatList
     */
    const renderItem = ({ item, index }) => {
        return (
            <View style={styles.productContainer}>
                <View style={styles.productCardWrapper}>
                    <ProductCard product={item} />
                </View>
            </View>
        );
    };

    /**
     * Component loading footer khi đang tải thêm sản phẩm
     */
    const LoadingFooter = () => {
        if (!isLoading || !pagination.hasMore) return null;

        return <FooterLoading text="Đang tải thêm sản phẩm..." />;
    };

    /**
     * Component footer khi không còn sản phẩm để tải
     */
    const NoMoreFooter = () => {
        if (pagination.hasMore || allProducts.length === 0) return null;

        return (
            <View style={styles.noMoreFooter}>
                <Text style={styles.noMoreText}>Không còn sản phẩm nào để tải</Text>
                <Text style={styles.totalProductsText}>Tổng cộng: {allProducts.length} sản phẩm</Text>
            </View>
        );
    };

    // Kiểm tra xem có đang loading lần đầu không
    const isInitialLoading = isLoading && pagination.currentPage === 1 && allProducts.length === 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D364C" />
            {renderHeader()}

            <View style={styles.content}>
                {/* Hiển thị loading khi đang tải lần đầu */}
                {isInitialLoading ? (
                    <InlineLoading text="Đang tải sản phẩm..." style={styles.loadingContainer} />
                ) : (
                    /* FlatList chính hiển thị danh sách sản phẩm */
                    <FlatList
                        data={allProducts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        numColumns={2} // Hiển thị 2 cột
                        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
                        onRefresh={handleRefresh} // Pull-to-refresh
                        refreshing={refreshing}
                        onEndReached={handleLoadMore} // Load more khi cuộn đến cuối
                        onEndReachedThreshold={0.1}
                        ListHeaderComponent={renderCategorySection} // Header component
                        ListFooterComponent={() => (
                            <>
                                <LoadingFooter />
                                <NoMoreFooter />
                            </>
                        )}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={400}
                        /* Component hiển thị khi danh sách trống */
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <LinearGradient
                                    colors={['#f8f9ff', '#e8ecff']}
                                    style={styles.emptyGradient}
                                >
                                    <View style={styles.emptyIconContainer}>
                                        <Icon name={currentSearch ? "search-off" : "inventory-2"} size={80} color="#c7d2fe" />
                                    </View>
                                    <Text style={styles.emptyTitle}>
                                        {currentSearch ? 'Không có kết quả tìm kiếm' : 'Không tìm thấy sản phẩm'}
                                    </Text>
                                    <Text style={styles.emptyText}>
                                        {currentSearch
                                            ? `Không tìm thấy sản phẩm nào phù hợp với "${currentSearch}"`
                                            : categoryName
                                                ? `Không có sản phẩm nào trong danh mục ${categoryName}`
                                                : 'Hiện tại không có sản phẩm nào'
                                        }
                                    </Text>
                                    {/* Nút thử lại */}
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={() => {
                                            dispatch(resetAllProducts());
                                            if (categoryName && !currentSearch) {
                                                // Thử lại sản phẩm theo danh mục
                                                dispatch(fetchProductsByCategoryAsync({
                                                    category_name: categoryName,
                                                    page: 1,
                                                    limit: ITEMS_PER_PAGE
                                                }));
                                            } else {
                                                // Thử lại tất cả sản phẩm hoặc tìm kiếm
                                                dispatch(fetchProductsAsync({
                                                    page: 1,
                                                    limit: ITEMS_PER_PAGE,
                                                    isAllProducts: true,
                                                    search: currentSearch
                                                }));
                                            }
                                        }}
                                    >
                                        <Text style={styles.retryButtonText}>Thử lại</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Modal tìm kiếm */}
            {renderSearchModal()}
        </SafeAreaView>
    );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
    // Container chính
    container: {
        flex: 1,
        backgroundColor: '#f0feff',
    },
    // Header container
    headerContainer: {
        position: 'relative',
        zIndex: 1000,
    },
    // Header với gradient background
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: StatusBar.currentHeight + 20,
        overflow: 'hidden',
        position: 'relative',
    },
    // Nội dung chính của header
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    // Nút quay lại
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
    // Container tiêu đề header
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    // Tiêu đề chính
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    // Tiêu đề phụ
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
        fontWeight: '500',
    },
    // Nút tìm kiếm trong header
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
    // Các element trang trí trong header
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
    // Nội dung chính của màn hình
    content: {
        flex: 1,
        backgroundColor: '#f0feff',
        marginTop: -25,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
    },
    // Style cho FlatList content
    listContent: {
        padding: 16,
        paddingTop: 30,
    },
    // Container cho CategorySection
    categorySectionContainer: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    // Container cho mỗi sản phẩm
    productContainer: {
        flex: 1,
        paddingHorizontal: 6,
        paddingVertical: 8,
    },
    // Wrapper cho ProductCard với shadow
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
    // Container loading chính
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0feff',
    },
    // Footer khi không còn sản phẩm
    noMoreFooter: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    noMoreText: {
        fontSize: 14,
        color: COLORS.text.secondary,
        fontWeight: '500',
        marginBottom: 4,
    },
    totalProductsText: {
        fontSize: 12,
        color: COLORS.text.light,
        fontWeight: '400',
    },
    // Container khi danh sách trống
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
    // Container icon khi trống
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
    // Tiêu đề khi trống
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0D364C',
        textAlign: 'center',
        marginBottom: 8,
    },
    // Text mô tả khi trống
    emptyText: {
        fontSize: 15,
        color: '#13C2C2',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    // Nút thử lại
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
    
    // STYLES CHO MODAL TÌM KIẾM
    // Container chính của modal
    searchModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    // Nội dung modal
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
    // Header của modal tìm kiếm
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    // Nút đóng modal
    searchCloseButton: {
        padding: 8,
        marginRight: 16,
    },
    // Tiêu đề modal tìm kiếm
    searchTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0D364C',
        flex: 1,
    },
    // Container input tìm kiếm
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
    // Icon tìm kiếm
    searchIcon: {
        marginRight: 12,
    },
    // Input tìm kiếm
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0D364C',
        paddingVertical: 4,
    },
    // Nút xóa input
    clearButton: {
        padding: 4,
    },
    // Container các nút hành động
    searchButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    // Nút tìm kiếm chính
    searchActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#13C2C2',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#13C2C2',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    // Style khi nút tìm kiếm bị disable
    searchActionButtonDisabled: {
        backgroundColor: '#d1d5db',
        shadowColor: '#d1d5db',
    },
    // Text của nút tìm kiếm
    searchActionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    // Nút xóa tất cả
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    clearAllButtonText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    // Container hiển thị kết quả tìm kiếm
    searchResultsContainer: {
        marginTop: 16,
        paddingHorizontal: 4,
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#13C2C2',
    },
    // Text kết quả tìm kiếm
    searchResultsText: {
        fontSize: 14,
        color: '#13C2C2',
        fontWeight: '600',
        marginBottom: 4,
    },
    // Text phụ kết quả tìm kiếm
    searchResultsSubText: {
        fontSize: 12,
        color: '#0D364C',
        fontWeight: '400',
    },
});

export default AllProductsScreen;