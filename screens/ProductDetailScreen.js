// Import các thư viện React Native và Redux cần thiết
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Modal,
    FlatList,
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Import các Redux actions để quản lý product và reviews
import { fetchProductByIdAsync } from '../store/slices/productSlice';
import {
    fetchProductReviewsByProductId,
    selectProductReviews,
    selectProductReviewsLoading
} from '../store/slices/reviewSlice';
import { addToCart } from '../store/slices/cartSlice';
// Import các component loading tùy chỉnh
import { InlineLoading, OverlayLoading } from '../components/Loading';
import { COLORS } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';
import Toast from 'react-native-toast-message';

// Lấy kích thước màn hình thiết bị
const { width } = Dimensions.get('window');

/**
 * Component ProductDetailScreen - Màn hình chi tiết sản phẩm
 * Chức năng chính:
 * - Hiển thị thông tin chi tiết sản phẩm (hình ảnh, tên, giá, mô tả)
 * - Quản lý số lượng và thêm vào giỏ hàng
 * - Hiển thị và quản lý đánh giá sản phẩm
 * - Xử lý trạng thái hết hàng và sản phẩm không hoạt động
 * - Kiểm tra authentication cho các tính năng
 */
const ProductDetailScreen = ({ navigation, route }) => {
    // Khởi tạo dispatch để gọi Redux actions
    const dispatch = useDispatch();
    
    // Khai báo các state local
    const [quantity, setQuantity] = useState(1); // Số lượng sản phẩm muốn mua
    const [isFavorite, setIsFavorite] = useState(false); // Trạng thái yêu thích (chưa sử dụng)
    const [showAllReviews, setShowAllReviews] = useState(false); // Hiển thị modal tất cả đánh giá
    const [showLoadingModal, setShowLoadingModal] = useState(false); // Modal loading khi thêm vào giỏ hàng
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal thành công

    // Lấy productId từ route parameters
    const productId = route?.params?.productId;

    // Lấy dữ liệu từ Redux store
    const { product, isLoading: productLoading, error } = useSelector((state) => state.product);

    // Lấy thông tin giỏ hàng để hiển thị badge số lượng
    const { cart } = useSelector((state) => state.cart);
    const itemCount = cart?.item_count || 0;

    // Lấy trạng thái đăng nhập
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Lấy reviews chỉ cho sản phẩm hiện tại
    const reviews = useSelector(state => selectProductReviews(state, productId));
    const reviewsLoading = useSelector(state => selectProductReviewsLoading(state, productId));

    // Kiểm tra sản phẩm có hết hàng không
    const isOutOfStock = product && product.quantity <= 0;

    /**
     * Effect hook để fetch dữ liệu khi component mount
     * Fetch thông tin sản phẩm và reviews
     */
    useEffect(() => {
        if (productId && productId !== 'undefined') {
            // Fetch thông tin chi tiết sản phẩm
            dispatch(fetchProductByIdAsync(productId));

            // Chỉ fetch reviews nếu chưa có data cho sản phẩm này
            // Hoặc nếu bạn muốn luôn refresh data, hãy bỏ điều kiện này
            if (!reviews || reviews.length === 0) {
                dispatch(fetchProductReviewsByProductId(productId));
            }
        }
    }, [dispatch, productId]); // Bỏ reviews khỏi dependency để tránh infinite loop

    /**
     * Effect hook để tự động điều chỉnh quantity khi sản phẩm hết hàng
     * Nếu quantity hiện tại vượt quá số lượng có sẵn, tự động giảm xuống
     */
    useEffect(() => {
        if (product && product.quantity > 0 && quantity > product.quantity) {
            setQuantity(product.quantity);
            Toast.show({
                type: 'info',
                text1: 'Số lượng đã được điều chỉnh',
                text2: `Số lượng đã được giảm xuống ${product.quantity} (tối đa có sẵn)`,
                position: 'top',
                visibilityTime: 2500,
            });
        }
    }, [product?.quantity, quantity]);

    // Tổng hợp trạng thái loading
    const isLoading = productLoading || reviewsLoading;

    /**
     * Tính toán rating trung bình từ tất cả reviews của sản phẩm hiện tại
     */
    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

    /**
     * Render các ngôi sao đánh giá
     * @param {number} rating - Điểm đánh giá (0-5)
     * @returns {Array} Mảng các component Icon ngôi sao
     */
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating); // Số sao đầy
        const hasHalfStar = rating % 1 !== 0; // Có sao nửa không

        // Render sao đầy
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Icon key={i} name="star" size={16} color="#FFD700" />
            );
        }

        // Render sao nửa nếu có
        if (hasHalfStar) {
            stars.push(
                <Icon key="half" name="star-half" size={16} color="#FFD700" />
            );
        }

        // Render sao rỗng cho phần còn lại
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Icon key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
            );
        }

        return stars;
    };

    /**
     * Render avatar của user trong reviews
     * Hiển thị ảnh avatar hoặc fallback với chữ cái đầu
     * @param {Object} user - Thông tin user
     * @returns {Component} Avatar component
     */
    const renderUserAvatar = (user) => {
        const avatarUrl = user?.avatar;
        const userName = user?.name || user?.user_name || user?.username || 'Anonymous';

        if (avatarUrl) {
            return (
                <Image
                    source={{ uri: avatarUrl }}
                    style={styles.userAvatar}
                    onError={() => {
                        // Fallback nếu không load được avatar
                    }}
                />
            );
        } else {
            // Fallback avatar với chữ cái đầu của tên
            const firstLetter = userName.charAt(0).toUpperCase();
            return (
                <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{firstLetter}</Text>
                </View>
            );
        }
    };

    /**
     * Render từng item review trong FlatList
     * @param {Object} param - Object chứa item và index
     * @returns {Component} Review item component
     */
    const renderReviewItem = ({ item: review, index }) => {
        return (
            <View key={review._id || index} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                    {/* Thông tin người đánh giá */}
                    <View style={styles.reviewerInfo}>
                        {renderUserAvatar(review.user)}
                        <View style={styles.reviewerDetails}>
                            <Text style={styles.reviewerName}>
                                {review.user?.name ||
                                    review.user?.user_name ||
                                    review.user?.username ||
                                    review.userName ||
                                    review.user_name ||
                                    'Anonymous'}
                            </Text>
                            <Text style={styles.reviewDate}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    {/* Số sao đánh giá */}
                    <View style={styles.starsContainer}>
                        {renderStars(review.rating)}
                    </View>
                </View>
                {/* Nội dung đánh giá */}
                <Text style={styles.reviewText}>{review.content}</Text>
            </View>
        );
    };

    /**
     * Render preview reviews (2 đánh giá đầu tiên)
     * Hiển thị tối đa 2 reviews và nút "Xem tất cả" nếu có nhiều hơn
     */
    const renderPreviewReviews = () => {
        if (!reviews || reviews.length === 0) {
            return (
                <Text style={styles.noReviewsText}>Chưa có đánh giá nào cho sản phẩm này.</Text>
            );
        }

        const previewReviews = reviews.slice(0, 2);

        return (
            <>
                {/* Hiển thị 2 reviews đầu tiên */}
                {previewReviews.map((review, index) => (
                    <View key={review._id || index} style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewerInfo}>
                                {renderUserAvatar(review.user)}
                                <View style={styles.reviewerDetails}>
                                    <Text style={styles.reviewerName}>
                                        {review.user?.name ||
                                            review.user?.user_name ||
                                            review.user?.username ||
                                            review.userName ||
                                            review.user_name ||
                                            'Anonymous'}
                                    </Text>
                                    <Text style={styles.reviewDate}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.starsContainer}>
                                {renderStars(review.rating)}
                            </View>
                        </View>
                        <Text style={styles.reviewText}>{review.content}</Text>
                    </View>
                ))}

                {/* Nút "Xem tất cả" nếu có nhiều hơn 2 reviews */}
                {reviews && reviews.length > 2 && (
                    <TouchableOpacity
                        style={styles.showAllButton}
                        onPress={() => setShowAllReviews(true)}
                    >
                        <Text style={styles.showAllButtonText}>
                            Xem tất cả đánh giá ({reviews.length})
                        </Text>
                        <Icon name="keyboard-arrow-right" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </>
        );
    };

    /**
     * Component Modal hiển thị tất cả reviews
     * Modal fullscreen với header và FlatList các reviews
     */
    const ReviewsModal = () => {
        return (
            <Modal
                visible={showAllReviews}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAllReviews(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {/* Header của modal */}
                    <View style={styles.modalHeader}>
                        {/* Nút đóng modal */}
                        <TouchableOpacity
                            onPress={() => setShowAllReviews(false)}
                            style={styles.modalCloseButton}
                        >
                            <Icon name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>

                        {/* Tiêu đề modal */}
                        <Text style={styles.modalTitle}>
                            Tất cả đánh giá ({reviews ? reviews.length : 0})
                        </Text>

                        {/* Nút refresh */}
                        <TouchableOpacity
                            style={styles.modalRefreshButton}
                            onPress={handleRefresh}
                        >
                            <Icon name="refresh" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Danh sách tất cả reviews */}
                    <FlatList
                        data={reviews}
                        renderItem={renderReviewItem}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.modalContent}
                        ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyReviewsContainer}>
                                <Icon name="rate-review" size={48} color="#ccc" />
                                <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào</Text>
                                <Text style={styles.emptyReviewsSubText}>
                                    Hãy là người đầu tiên đánh giá sản phẩm này
                                </Text>
                            </View>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        );
    };

    /**
     * Xử lý thay đổi số lượng sản phẩm
     * @param {string} type - Loại thay đổi ('increase' hoặc 'decrease')
     */
    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            // Kiểm tra không vượt quá số lượng trong kho
            if (quantity >= product.quantity) {
                // Hiển thị thông báo khi vượt quá số lượng kho
                Toast.show({
                    type: 'error',
                    text1: 'Vượt quá số lượng kho',
                    text2: `Chỉ còn ${product.quantity} sản phẩm trong kho`,
                    position: 'top',
                    visibilityTime: 2500,
                });
                return;
            }
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    /**
     * Xử lý thêm sản phẩm vào giỏ hàng
     * Kiểm tra authentication và validate số lượng trước khi thêm
     */
    const handleAddToCart = async () => {
        if (showLoadingModal || isOutOfStock) return; // Ngăn click nhiều lần hoặc khi hết hàng

        // Kiểm tra user đã đăng nhập chưa
        if (!isAuthenticated) {
            Alert.alert(
                'Yêu cầu đăng nhập',
                'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn đăng nhập ngay không?',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        // Validate số lượng trước khi thêm vào giỏ hàng
        if (quantity > product.quantity) {
            Toast.show({
                type: 'error',
                text1: 'Số lượng không hợp lệ',
                text2: `Chỉ còn ${product.quantity} sản phẩm trong kho. Vui lòng giảm số lượng.`,
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        // Hiển thị loading modal
        setShowLoadingModal(true);
        try {
            // Gọi Redux action để thêm vào giỏ hàng
            await dispatch(addToCart({
                product_id: productId,
                quantity: quantity
            })).unwrap();

            // Ẩn loading và hiển thị success modal
            setShowLoadingModal(false);
            setShowSuccessModal(true);

            // Tự động ẩn success modal sau 2 giây
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);

        } catch (error) {
            setShowLoadingModal(false);

            // Hiển thị thông báo lỗi
            Toast.show({
                type: 'error',
                text1: 'Không thể thêm vào giỏ hàng',
                text2: error?.toString() || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng',
                position: 'top',
                visibilityTime: 2500,
            });
        }
    };

    /**
     * Xử lý click vào icon giỏ hàng
     * Kiểm tra authentication trước khi navigate
     */
    const handleCartPress = () => {
        if (isAuthenticated) {
            navigation.navigate('Cart');
        } else {
            Alert.alert(
                'Yêu cầu đăng nhập',
                'Bạn cần đăng nhập để xem giỏ hàng. Bạn có muốn đăng nhập ngay không?',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
                ]
            );
        }
    };

    /**
     * Function refresh để fetch lại data khi cần
     * Sử dụng useCallback để tối ưu performance
     */
    const handleRefresh = useCallback(() => {
        if (productId) {
            dispatch(fetchProductByIdAsync(productId));
            dispatch(fetchProductReviewsByProductId(productId));

            Toast.show({
                type: 'success',
                text1: 'Đã làm mới dữ liệu',
                text2: 'Thông tin sản phẩm đã được cập nhật',
                position: 'top',
                visibilityTime: 1500,
            });
        }
    }, [dispatch, productId]);

    // Render error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Lỗi: {error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRefresh}
                >
                    <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Render loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

                {/* Header khi loading */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Product Details</Text>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleCartPress}
                    >
                        <Icon name="shopping-cart" size={24} color="rgba(255, 255, 255, 0.85)" />
                        {itemCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{itemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Nội dung loading */}
                <InlineLoading text="Đang tải sản phẩm..." style={styles.loadingContainer} />
            </SafeAreaView>
        );
    }

    // Render state khi không tìm thấy sản phẩm
    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Render state khi sản phẩm bị ẩn (status = false)
    if (product.status === false) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleCartPress}
                    >
                        <Icon name="shopping-cart" size={24} color="rgba(255, 255, 255, 0.85)" />
                        {itemCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{itemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Thông báo sản phẩm không khả dụng */}
                <View style={styles.inactiveContainer}>
                    <View style={styles.inactiveWrapper}>
                        <Icon name="block" size={80} color="#ff6b6b" />
                        <Text style={styles.inactiveTitle}>Sản phẩm không khả dụng</Text>
                        <Text style={styles.inactiveText}>
                            Sản phẩm này hiện tại không có sẵn để mua.
                        </Text>
                        <TouchableOpacity
                            style={styles.goBackButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.goBackButtonText}>Quay lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Render main content - Nội dung chính khi có sản phẩm hợp lệ
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

            {/* Header với nút back, title và cart */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Product Details</Text>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleCartPress}
                >
                    <Icon name="shopping-cart" size={24} color="rgba(255, 255, 255, 0.85)" />
                    {/* Badge hiển thị số lượng item trong cart */}
                    {itemCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{itemCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Nội dung chính - ScrollView chứa tất cả thông tin sản phẩm */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Container hình ảnh sản phẩm */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Thông tin sản phẩm */}
                <View style={styles.productInfo}>
                    {/* Tên sản phẩm */}
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Container đánh giá và số sao */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                            {renderStars(averageRating)}
                        </View>
                        <Text style={styles.ratingText}>({averageRating.toFixed(1)})</Text>
                        <Text style={styles.reviewCount}>• {reviews ? reviews.length : 0} Đánh giá</Text>
                    </View>

                    {/* Container giá và quantity selector */}
                    <View style={styles.priceQuantityContainer}>
                        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                        <View style={styles.quantityContainer}>
                            {/* Nút giảm quantity */}
                            <TouchableOpacity
                                style={[
                                    styles.quantityButton,
                                    quantity <= 1 && styles.quantityButtonDisabled
                                ]}
                                onPress={() => handleQuantityChange('decrease')}
                                disabled={quantity <= 1}
                            >
                                <Icon name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#666"} />
                            </TouchableOpacity>

                            {/* Hiển thị số lượng hiện tại */}
                            <Text style={styles.quantityText}>{quantity}</Text>

                            {/* Nút tăng quantity */}
                            <TouchableOpacity
                                style={[
                                    styles.quantityButton,
                                    (quantity >= product.quantity || isOutOfStock) && styles.quantityButtonDisabled
                                ]}
                                onPress={() => handleQuantityChange('increase')}
                                disabled={quantity >= product.quantity || isOutOfStock}
                            >
                                <Icon
                                    name="add"
                                    size={20}
                                    color={(quantity >= product.quantity || isOutOfStock) ? "#ccc" : "#666"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Section mô tả sản phẩm */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.description}>{product.detail_desc}</Text>
                    </View>

                    {/* Section thông tin sản phẩm */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
                        {/* Danh mục sản phẩm */}
                        <View style={styles.featureItem}>
                            <Icon name="label" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Danh mục: {product.category_id?.name || 'Chung'}</Text>
                        </View>
                        {/* Loại sản phẩm */}
                        <View style={styles.featureItem}>
                            <Icon name="category" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Loại: {product.target}</Text>
                        </View>
                        {/* Đánh giá trung bình */}
                        <View style={styles.featureItem}>
                            <Icon name="star" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Đánh giá: {averageRating.toFixed(1)}/5</Text>
                        </View>
                        {/* Trạng thái kho hàng */}
                        <View style={styles.featureItem}>
                            <Icon
                                name={isOutOfStock ? "remove-shopping-cart" : "inventory"}
                                size={16}
                                color={isOutOfStock ? "#ff4757" : "#4caf50"}
                            />
                            <Text style={[
                                styles.featureText,
                                isOutOfStock && styles.outOfStockText
                            ]}>
                                {isOutOfStock ? 'Hết hàng' : `Số lượng: ${product.quantity} sản phẩm`}
                            </Text>
                        </View>
                    </View>

                    {/* Section reviews - CHỈ hiển thị preview */}
                    <View style={styles.section}>
                        <View style={styles.reviewsHeader}>
                            <Text style={styles.sectionTitle}>
                                Đánh giá ({reviews ? reviews.length : 0})
                            </Text>
                            {/* Nút refresh reviews */}
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={handleRefresh}
                            >
                                <Icon name="refresh" size={20} color={COLORS.primary} />
                                <Text style={styles.refreshText}>Làm mới</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Container hiển thị preview reviews */}
                        <View style={styles.reviewsPreviewContainer}>
                            {renderPreviewReviews()}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Modal hiển thị tất cả reviews */}
            <ReviewsModal />

            {/* Modal loading khi thêm vào giỏ hàng */}
            <OverlayLoading text="Đang thêm vào giỏ hàng..." visible={showLoadingModal} />

            {/* Modal thành công */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showSuccessModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Icon name="check-circle" size={50} color="#4CAF50" />
                        <Text style={styles.modalText}>Thêm vào giỏ hàng thành công!</Text>
                    </View>
                </View>
            </Modal>

            {/* Bottom Action Bar - Nút thêm vào giỏ hàng */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={[
                        styles.addToCartButtonFull,
                        isOutOfStock && styles.addToCartButtonDisabled
                    ]}
                    onPress={handleAddToCart}
                    disabled={showLoadingModal || isOutOfStock}
                >
                    <Icon
                        name={isOutOfStock ? "remove-shopping-cart" : "shopping-cart"}
                        size={20}
                        color={isOutOfStock ? "#999" : COLORS.white}
                    />
                    <Text style={[
                        styles.addToCartTextFull,
                        isOutOfStock && styles.addToCartTextDisabled
                    ]}>
                        {isOutOfStock ? 'Hết hàng' : 'Add to Cart'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Toast Message để hiển thị thông báo */}
            <Toast />
        </SafeAreaView>
    );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
    // Container chính
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Container loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    // Container lỗi
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#ff4757',
        marginBottom: 10,
        textAlign: 'center',
    },
    // Nút thử lại
    retryButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Header của màn hình
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: StatusBar.currentHeight + 16,
        backgroundColor: COLORS.primary,
        elevation: 5,
    },
    // Nút trong header
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        position: 'relative',
    },
    // Tiêu đề header
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.white,
    },
    // Nội dung chính
    content: {
        flex: 1,
    },
    // Container hình ảnh sản phẩm
    imageContainer: {
        position: 'relative',
        height: 300,
        backgroundColor: '#f8f9fa',
    },
    // Hình ảnh sản phẩm
    productImage: {
        width: '100%',
        height: '100%',
    },
    // Container thông tin sản phẩm
    productInfo: {
        padding: 16,
    },
    // Tên sản phẩm
    productName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    // Container đánh giá
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    // Container các ngôi sao
    starsContainer: {
        flexDirection: 'row',
    },
    // Text hiển thị rating
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    // Text số lượng reviews
    reviewCount: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    // Container giá và quantity
    priceQuantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    // Text giá sản phẩm
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007bff',
    },
    // Container quantity selector
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Nút thay đổi quantity
    quantityButton: {
        width: 32,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Text hiển thị quantity
    quantityText: {
        fontSize: 16,
        fontWeight: '500',
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: 'center',
    },
    // Section container
    section: {
        marginBottom: 24,
    },
    // Tiêu đề section
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    // Mô tả sản phẩm
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    // Item trong feature list
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    // Text trong feature item
    featureText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    // Header của reviews section
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    // Nút refresh
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    refreshText: {
        fontSize: 12,
        color: COLORS.primary,
        marginLeft: 4,
        fontWeight: '500',
    },
    // Container preview reviews
    reviewsPreviewContainer: {
        paddingBottom: 100,  // Tăng giá trị này nếu cần khoảng cách nhiều hơn
    },
    // Item review
    reviewItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    // Header của review item
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    // Thông tin người review
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    // Avatar user
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    // Avatar fallback
    avatarFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarFallbackText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    // Chi tiết người review
    reviewerDetails: {
        flex: 1,
    },
    // Tên người review
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    // Nội dung review
    reviewText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginTop: 8,
    },
    // Ngày review
    reviewDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    // Text khi không có reviews
    noReviewsText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    },
    // Nút "Xem tất cả"
    showAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginTop: 8,
    },
    showAllButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.primary,
        marginRight: 8,
    },
    
    // STYLES CHO MODAL REVIEWS
    // Container modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // Header modal
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    // Nút đóng modal
    modalCloseButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    // Tiêu đề modal
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    // Nút refresh trong modal
    modalRefreshButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    // Nội dung modal (đổi tên để tránh duplicate)
    modalContent: {
        padding: 16,
    },
    // Separator giữa các reviews
    reviewSeparator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    // Container khi không có reviews
    emptyReviewsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyReviewsText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#666',
        marginTop: 16,
    },
    emptyReviewsSubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    // Action bar ở bottom
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.light,
    },
    // Nút thêm vào giỏ hàng
    addToCartButtonFull: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        elevation: 2,
        shadowColor: COLORS.shadow?.dark || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    addToCartTextFull: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
        marginLeft: 8,
    },
    // Overlay cho modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Content modal success (đổi tên để tránh duplicate)
    modalSuccessContent: {
        backgroundColor: COLORS.white,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 250,
        elevation: 5,
        shadowColor: COLORS.shadow?.dark || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    // Text trong modal
    modalText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text?.primary || '#333',
        marginTop: 15,
        textAlign: 'center',
    },
    // Container khi sản phẩm inactive
    inactiveContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 20,
    },
    // Wrapper cho inactive state
    inactiveWrapper: {
        backgroundColor: COLORS.white,
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: COLORS.shadow?.dark || '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        maxWidth: 300,
    },
    // Tiêu đề inactive
    inactiveTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ff6b6b',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    // Text inactive
    inactiveText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    // Nút quay lại
    goBackButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    goBackButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    // Text khi hết hàng
    outOfStockText: {
        color: '#ff4757',
    },
    // Nút disabled
    addToCartButtonDisabled: {
        backgroundColor: '#ccc',
    },
    addToCartTextDisabled: {
        color: '#999',
    },
    quantityButtonDisabled: {
        backgroundColor: '#f0f0f0',
    },
    // Badge trên cart icon
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
});

export default ProductDetailScreen;