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
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchProductByIdAsync } from '../store/slices/productSlice';
import {
    fetchProductReviewsByProductId,
    selectProductReviews,
    selectProductReviewsLoading
} from '../store/slices/reviewSlice';
import { addToCart } from '../store/slices/cartSlice';
import { COLORS } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Get product ID from route params
    const productId = route?.params?.productId;

    // Get product and loading state from Redux
    const { product, isLoading: productLoading, error } = useSelector((state) => state.product);

    // Get reviews for this specific product ONLY
    const reviews = useSelector(state => selectProductReviews(state, productId));
    const reviewsLoading = useSelector(state => selectProductReviewsLoading(state, productId));

    // Fetch data chỉ khi cần thiết (không clear data cũ)
    useEffect(() => {
        if (productId && productId !== 'undefined') {
            // Fetch product details
            dispatch(fetchProductByIdAsync(productId));

            // Chỉ fetch reviews nếu chưa có data cho sản phẩm này
            // Hoặc nếu bạn muốn luôn refresh data, hãy bỏ điều kiện này
            if (!reviews || reviews.length === 0) {
                dispatch(fetchProductReviewsByProductId(productId));
            }
        }
    }, [dispatch, productId]); // Bỏ reviews khỏi dependency để tránh infinite loop

    const isLoading = productLoading || reviewsLoading;

    // Calculate average rating from reviews của sản phẩm hiện tại
    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Icon key={i} name="star" size={16} color="#FFD700" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Icon key="half" name="star-half" size={16} color="#FFD700" />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Icon key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
            );
        }

        return stars;
    };

    // Render Avatar component
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

    // Render individual review item
    const renderReviewItem = ({ item: review, index }) => {
        return (
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
        );
    };

    // Render preview reviews (first 2 reviews)
    const renderPreviewReviews = () => {
        if (!reviews || reviews.length === 0) {
            return (
                <Text style={styles.noReviewsText}>No reviews yet for this product.</Text>
            );
        }

        const previewReviews = reviews.slice(0, 2);

        return (
            <>
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

                {reviews.length > 2 && (
                    <TouchableOpacity
                        style={styles.showAllButton}
                        onPress={() => setShowAllReviews(true)}
                    >
                        <Text style={styles.showAllButtonText}>
                            Show All Reviews ({reviews.length})
                        </Text>
                        <Icon name="keyboard-arrow-right" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </>
        );
    };

    // Reviews Modal Component
    const ReviewsModal = () => {
        return (
            <Modal
                visible={showAllReviews}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAllReviews(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowAllReviews(false)}
                            style={styles.modalCloseButton}
                        >
                            <Icon name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>
                            All Reviews ({reviews ? reviews.length : 0})
                        </Text>

                        <TouchableOpacity
                            style={styles.modalRefreshButton}
                            onPress={handleRefresh}
                        >
                            <Icon name="refresh" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Reviews List */}
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
                                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                                <Text style={styles.emptyReviewsSubText}>
                                    Be the first to review this product
                                </Text>
                            </View>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        );
    };

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (showLoadingModal) return; // Prevent multiple clicks

        setShowLoadingModal(true);
        try {
            await dispatch(addToCart({
                product_id: productId,
                quantity: quantity
            })).unwrap();

            // Hide loading and show success
            setShowLoadingModal(false);
            setShowSuccessModal(true);

            // Auto hide success modal after 2 seconds
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);

        } catch (error) {
            console.error('Failed to add to cart:', error);
            setShowLoadingModal(false);
            // Could add error modal here
        }
    };



    // Refresh function để fetch lại data khi cần
    const handleRefresh = useCallback(() => {
        if (productId) {
            dispatch(fetchProductByIdAsync(productId));
            dispatch(fetchProductReviewsByProductId(productId));
        }
    }, [dispatch, productId]);

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRefresh}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading product...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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

                <Text style={styles.headerTitle}>Product Details</Text>

                <View style={styles.headerButton} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                    />
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                            {renderStars(averageRating)}
                        </View>
                        <Text style={styles.ratingText}>({averageRating.toFixed(1)})</Text>
                        <Text style={styles.reviewCount}>• {reviews ? reviews.length : 0} Reviews</Text>
                    </View>

                    {/* Price and Quantity */}
                    <View style={styles.priceQuantityContainer}>
                        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange('decrease')}
                            >
                                <Icon name="remove" size={20} color="#666" />
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>{quantity}</Text>

                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange('increase')}
                            >
                                <Icon name="add" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{product.detail_desc}</Text>
                    </View>

                    {/* Type and Rating */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <View style={styles.featureItem}>
                            <Icon name="label" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Category: {product.category_id?.name || 'General'}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Icon name="category" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Type: {product.target}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Icon name="star" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Rating: {averageRating.toFixed(1)}/5</Text>
                        </View>
                    </View>

                    {/* Reviews Section - CHỈ hiển thị preview */}
                    <View style={styles.section}>
                        <View style={styles.reviewsHeader}>
                            <Text style={styles.sectionTitle}>
                                Reviews ({reviews ? reviews.length : 0})
                            </Text>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={handleRefresh}
                            >
                                <Icon name="refresh" size={20} color={COLORS.primary} />
                                <Text style={styles.refreshText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Preview Reviews */}
                        <View style={styles.reviewsPreviewContainer}>
                            {renderPreviewReviews()}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Reviews Modal */}
            <ReviewsModal />

            {/* Loading Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showLoadingModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.modalText}>Đang thêm vào giỏ hàng...</Text>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
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

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.addToCartButtonFull}
                    onPress={handleAddToCart}
                    disabled={showLoadingModal}
                >
                    <Icon name="shopping-cart" size={20} color={COLORS.white} />
                    <Text style={styles.addToCartTextFull}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
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
    },
    imageContainer: {
        position: 'relative',
        height: 300,
        backgroundColor: '#f8f9fa',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 16,
    },
    productName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    reviewCount: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    priceQuantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007bff',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '500',
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
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
    reviewsPreviewContainer: {
        paddingBottom: 100,  // Tăng giá trị này nếu cần khoảng cách nhiều hơn
    },
    reviewItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
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
    reviewerDetails: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginTop: 8,
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    noReviewsText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    },
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
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
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
    modalCloseButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    modalRefreshButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    modalContent: {
        padding: 16,
    },
    reviewSeparator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
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
    modalText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text?.primary || '#333',
        marginTop: 15,
        textAlign: 'center',
    },
});

export default ProductDetailScreen;