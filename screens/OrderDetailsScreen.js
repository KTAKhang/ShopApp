// Import các thư viện React Native và Redux cần thiết
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
// Import các Redux actions để quản lý reviews và orders
import {
    createReview,
    updateReview,
    clearReviewState,
    getReviewsByOrderId
} from '../store/slices/reviewSlice';
import {
    cancelOrder,
    returnOrder,
    clearOrderState
} from '../store/slices/orderSlice';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Component OrderDetailsScreen - Màn hình chi tiết đơn hàng
 * Chức năng chính:
 * - Hiển thị thông tin chi tiết đơn hàng (sản phẩm, địa chỉ, tổng tiền)
 * - Quản lý đánh giá sản phẩm (tạo mới, chỉnh sửa, hiển thị)
 * - Xử lý hủy đơn hàng và trả hàng
 * - Hiển thị trạng thái đơn hàng với màu sắc tương ứng
 */
const OrderDetailsScreen = ({ navigation }) => {
    // Lấy dữ liệu từ route parameters
    const route = useRoute();
    const { orderData, orderDataColor, orderDataBg } = route.params;

    // Khởi tạo dispatch để gọi Redux actions
    const dispatch = useDispatch();

    // Lấy dữ liệu review từ Redux store
    const reviewState = useSelector((state) => state.review);
    const { isLoading, error, successMessage, review } = reviewState;

    // Lấy dữ liệu order từ Redux store
    const orderState = useSelector((state) => state.order);
    const {
        isLoading: orderLoading,
        cancelSuccess,
        cancelMessage,
        returnSuccess,
        returnMessage,
        error: orderError
    } = orderState;

    // useRef để tránh hiển thị alert nhiều lần
    const alertShownRef = useRef(false); // Dùng useRef để tránh lặp alert

    /**
     * Mapping trạng thái đơn hàng từ API sang hiển thị tiếng Việt
     */
    const statusMapping = {
        'PENDING': 'Chờ xử lý',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPED': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy',
        'RETURNED': 'Đã trả'
    };

    // Khai báo các state local
    const [orderStatus, setOrderStatus] = useState(
        statusMapping[orderData?.order_status?.name] || 'Chờ xử lý'
    );
    const [isRefetchingReviews, setIsRefetchingReviews] = useState(false); // Loading state khi fetch reviews

    /**
     * Khởi tạo state ban đầu cho ratings và reviews của từng sản phẩm
     */
    const initialRatings = {};
    const initialReviews = {};
    const initialSubmittedReviews = {};
    const initialExistingReviews = {};

    // Tạo state ban đầu cho mỗi sản phẩm trong đơn hàng
    orderData?.items?.forEach((item) => {
        initialRatings[item.product_id] = 0; // Rating mặc định = 0
        initialReviews[item.product_id] = ''; // Review content rỗng
        initialExistingReviews[item.product_id] = null; // Chưa có review existing
        initialSubmittedReviews[item.product_id] = false; // Chưa submit review
    });

    // Khai báo các state để quản lý reviews
    const [ratings, setRatings] = useState(initialRatings); // Rating của từng sản phẩm
    const [reviews, setReviews] = useState(initialReviews); // Nội dung review của từng sản phẩm
    const [submittedReviews, setSubmittedReviews] = useState(initialSubmittedReviews); // Trạng thái đã submit
    const [existingReviews, setExistingReviews] = useState(initialExistingReviews); // Reviews đã tồn tại
    const [editingReviews, setEditingReviews] = useState({}); // Trạng thái đang edit review

    /**
     * Effect hook để fetch reviews khi component mount
     */
    useEffect(() => {
        const fetchReviews = async () => {
            setIsRefetchingReviews(true);
            try {
                await dispatch(getReviewsByOrderId(orderData.order_id));
            } finally {
                setIsRefetchingReviews(false);
            }
        };
        fetchReviews();
    }, [dispatch]);

    /**
     * Effect hook để cập nhật state khi có reviews từ API
     * Map reviews existing vào các state tương ứng
     */
    useEffect(() => {
        if (Array.isArray(review)) {
            const newRatings = {};
            const newReviews = {};
            const newSubmittedReviews = {};
            const newExistingReviews = {};

            // Duyệt qua từng sản phẩm và map với reviews existing
            orderData?.items?.forEach((item) => {
                const productId = item.product_id;
                const existingReview = review.find(r => r.product && r.product._id === productId);

                newRatings[productId] = existingReview?.rating || 0;
                newReviews[productId] = existingReview?.content || '';
                newSubmittedReviews[productId] = !!existingReview;
                newExistingReviews[productId] = existingReview || null;
            });

            // Cập nhật tất cả state cùng lúc
            setRatings(newRatings);
            setReviews(newReviews);
            setSubmittedReviews(newSubmittedReviews);
            setExistingReviews(newExistingReviews);
        }
    }, [review, orderData?.items]);

    /**
     * Effect hook để xử lý success/error message của review actions
     * Hiển thị alert và refresh data sau khi thành công
     */
    useEffect(() => {
        // Xử lý success message
        if (successMessage && !isLoading && !error && !alertShownRef.current) {
            alertShownRef.current = true;

            Alert.alert(
                'Thành công',
                'Đánh giá đã được gửi thành công!',
                [{
                    text: 'OK',
                    onPress: async () => {
                        dispatch(clearReviewState());
                        alertShownRef.current = false;

                        // Refresh reviews sau khi thành công
                        setIsRefetchingReviews(true);
                        try {
                            await dispatch(getReviewsByOrderId(orderData.order_id));
                        } finally {
                            setIsRefetchingReviews(false);
                        }
                    }
                }]
            );
        }

        // Xử lý error message
        if (error && !isLoading && !alertShownRef.current) {
            alertShownRef.current = true;

            Alert.alert(
                'Lỗi',
                error,
                [{
                    text: 'OK',
                    onPress: () => {
                        dispatch(clearReviewState());
                        alertShownRef.current = false;
                    }
                }]
            );
        }

        // Reset flag khi không có message
        if (!successMessage && !error) {
            alertShownRef.current = false;
        }
    }, [successMessage, error, isLoading, dispatch, orderData.order_id]);

    /**
     * Effect hook để xử lý success/error của order actions (cancel, return)
     */
    useEffect(() => {
        // Xử lý thành công hủy đơn hàng
        if (cancelSuccess && cancelMessage) {
            Alert.alert(
                'Thành công',
                cancelMessage,
                [{
                    text: 'OK',
                    onPress: () => {
                        dispatch(clearOrderState());
                        setOrderStatus('Đã hủy');
                        navigation.goBack();
                    }
                }]
            );
        }

        // Xử lý thành công trả hàng
        if (returnSuccess && returnMessage) {
            Alert.alert(
                'Thành công',
                returnMessage,
                [{
                    text: 'OK',
                    onPress: () => {
                        dispatch(clearOrderState());
                        setOrderStatus('Đã trả');
                        navigation.goBack();
                    }
                }]
            );
        }

        // Xử lý lỗi order actions
        if (orderError) {
            Alert.alert(
                'Lỗi',
                orderError,
                [{
                    text: 'OK',
                    onPress: () => dispatch(clearOrderState())
                }]
            );
        }
    }, [cancelSuccess, cancelMessage, returnSuccess, returnMessage, orderError, dispatch, navigation]);

    /**
     * Xử lý hủy đơn hàng
     * Hiển thị confirmation dialog trước khi thực hiện
     */
    const handleCancelOrder = () => {
        Alert.alert(
            'Hủy đơn hàng',
            'Bạn có chắc chắn muốn hủy đơn hàng này không?',
            [
                {
                    text: 'Không',
                    style: 'cancel'
                },
                {
                    text: 'Có, Hủy đơn',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(cancelOrder(orderData.order_id));
                    }
                }
            ]
        );
    };

    /**
     * Xử lý trả hàng
     * Hiển thị confirmation dialog trước khi thực hiện
     */
    const handleReturnOrder = () => {
        Alert.alert(
            'Trả hàng',
            'Bạn có chắc chắn muốn trả hàng cho đơn hàng này không?',
            [
                {
                    text: 'Không',
                    style: 'cancel'
                },
                {
                    text: 'Có, Trả hàng',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(returnOrder(orderData.order_id));
                    }
                }
            ]
        );
    };

    /**
     * Xử lý click vào ngôi sao để rating
     * @param {string} productId - ID của sản phẩm
     * @param {number} starIndex - Index của ngôi sao (0-4)
     */
    const handleStarPress = (productId, starIndex) => {
        const hasReviewed = submittedReviews[productId];
        const isEditing = editingReviews[productId];

        // Chỉ cho phép rating nếu đơn hàng đã giao và:
        // 1. Chưa có review, hoặc
        // 2. Có review nhưng đang ở chế độ edit
        if (orderStatus === 'Đã giao' && (!hasReviewed || isEditing)) {
            setRatings(prev => ({
                ...prev,
                [productId]: starIndex + 1,
            }));
        }
    };

    /**
     * Bật chế độ edit review cho sản phẩm
     * @param {string} productId - ID của sản phẩm
     */
    const handleEditReview = (productId) => {
        setEditingReviews(prev => ({
            ...prev,
            [productId]: true,
        }));
    };

    /**
     * Hủy chế độ edit và reset về giá trị ban đầu
     * @param {string} productId - ID của sản phẩm
     */
    const handleCancelEdit = (productId) => {
        // Reset về giá trị gốc
        const existingReview = existingReviews[productId];
        if (existingReview) {
            setRatings(prev => ({
                ...prev,
                [productId]: existingReview.rating,
            }));
            setReviews(prev => ({
                ...prev,
                [productId]: existingReview.content,
            }));
        }

        setEditingReviews(prev => ({
            ...prev,
            [productId]: false,
        }));
    };

    /**
     * Submit review (tạo mới hoặc cập nhật)
     * @param {string} productId - ID của sản phẩm
     */
    const handleSubmitReview = async (productId) => {
        const rating = ratings[productId];
        const reviewContent = reviews[productId].trim();

        // Validation
        if (rating === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn mức đánh giá');
            return;
        }

        if (!reviewContent) {
            Alert.alert('Lỗi', 'Vui lòng viết đánh giá');
            return;
        }

        // Tìm item để lấy order_details_id và thông tin review existing
        const item = orderData?.items?.find(item => item.product_id === productId);
        if (!item) {
            Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
            return;
        }

        const existingReview = existingReviews[productId];
        const isEditing = editingReviews[productId];

        try {
            let result;

            if (existingReview && isEditing) {
                // Cập nhật review existing sử dụng _id từ review object
                result = await dispatch(updateReview({
                    review_id: existingReview._id,
                    rating: rating,
                    review_content: reviewContent,
                }));
            } else {
                // Tạo review mới
                if (!item.order_details_id) {
                    Alert.alert('Lỗi', 'Không tìm thấy ID chi tiết đơn hàng');
                    return;
                }

                result = await dispatch(createReview({
                    product_id: productId,
                    order_detail_id: item.order_details_id,
                    rating: rating,
                    review_content: reviewContent,
                }));
            }

            // Nếu thành công, thoát khỏi chế độ edit ngay lập tức
            if (createReview.fulfilled.match(result) || updateReview.fulfilled.match(result)) {
                // Thoát chế độ edit ngay lập tức
                setEditingReviews(prev => ({
                    ...prev,
                    [productId]: false,
                }));

                // Note: Success message sẽ được xử lý bởi useEffect phía trên
                // Không cần manually refresh ở đây vì được xử lý trong alert callback
            }
        } catch (error) {
            console.error('Submit review error:', error);
        }
    };

    /**
     * Render các ngôi sao rating cho sản phẩm
     * @param {string} productId - ID của sản phẩm
     * @returns {Component} Component chứa 5 ngôi sao
     */
    const renderStars = (productId) => {
        const currentRating = ratings[productId];
        const hasReviewed = submittedReviews[productId];
        const isEditing = editingReviews[productId];

        return (
            <View style={styles.starsContainer}>
                {[...Array(5)].map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleStarPress(productId, index)}
                        disabled={orderStatus !== 'Đã giao' || (hasReviewed && !isEditing) || isRefetchingReviews}
                    >
                        <Icon
                            name={index < currentRating ? 'star' : 'star-border'}
                            size={24}
                            color={index < currentRating ? (orderDataColor || '#FFB800') : '#D1D5DB'}
                            style={[
                                styles.star,
                                (orderStatus !== 'Đã giao' || (hasReviewed && !isEditing) || isRefetchingReviews) && styles.disabledStar
                            ]}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    /**
     * Render section đánh giá cho sản phẩm
     * Chỉ hiển thị khi đơn hàng đã giao
     * @param {string} productId - ID của sản phẩm
     * @returns {Component} Section đánh giá hoặc null
     */
    const renderRatingSection = (productId) => {
        if (orderStatus !== 'Đã giao') return null;

        const hasReviewed = submittedReviews[productId];
        const isEditing = editingReviews[productId];

        // Hiển thị loading state khi đang refetch reviews
        if (isRefetchingReviews) {
            return (
                <View style={styles.ratingSection}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={orderDataColor || '#1CD4D4'} />
                        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.ratingSection}>
                {/* Tiêu đề section */}
                <Text style={styles.ratingTitle}>
                    {hasReviewed && !isEditing ? 'Đánh giá của bạn' :
                        hasReviewed && isEditing ? 'Chỉnh sửa đánh giá' :
                            'Đánh giá sản phẩm này'}
                </Text>
                {/* Container các ngôi sao */}
                {renderStars(productId)}

                {hasReviewed && !isEditing ? (
                    // Hiển thị review existing với option edit
                    <View style={styles.reviewedContainer}>
                        <View style={styles.existingReviewContent}>
                            <Text style={styles.existingReviewText}>
                                "{reviews[productId]}"
                            </Text>
                        </View>
                        <View style={styles.reviewActions}>
                            {/* Indicator đã đánh giá */}
                            <View style={styles.submittedIndicator}>
                                <Icon name="check-circle" size={16} color="#22C55E" />
                                <Text style={styles.submittedText}>Đã đánh giá</Text>
                            </View>
                            {/* Nút edit */}
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => handleEditReview(productId)}
                                disabled={isRefetchingReviews}
                            >
                                <Icon name="edit" size={16} color={orderDataColor || '#1CD4D4'} />
                                <Text style={[styles.editButtonText, { color: orderDataColor || '#1CD4D4' }]}>
                                    Chỉnh sửa
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Hiển thị form cho review mới hoặc edit review existing
                    <>
                        {/* TextInput cho nội dung review */}
                        <TextInput
                            style={[
                                styles.reviewInput,
                                { borderColor: orderDataColor || '#D1D5DB' }
                            ]}
                            placeholder="Viết đánh giá của bạn ở đây..."
                            multiline
                            numberOfLines={3}
                            value={reviews[productId]}
                            onChangeText={(text) => {
                                setReviews(prev => ({
                                    ...prev,
                                    [productId]: text,
                                }));
                            }}
                            editable={!isRefetchingReviews}
                        />
                        {/* Container các nút action */}
                        <View style={styles.reviewButtonsContainer}>
                            {/* Nút hủy (chỉ hiển thị khi đang edit) */}
                            {isEditing && (
                                <TouchableOpacity
                                    style={[styles.cancelButton]}
                                    onPress={() => handleCancelEdit(productId)}
                                    disabled={isLoading || isRefetchingReviews}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                            )}
                            {/* Nút submit */}
                            <TouchableOpacity
                                style={[
                                    styles.submitReviewButton,
                                    { backgroundColor: orderDataColor || '#1CD4D4' },
                                    (isLoading || isRefetchingReviews) && styles.disabledButton,
                                    isEditing && styles.submitButtonSmall
                                ]}
                                onPress={() => handleSubmitReview(productId)}
                                disabled={isLoading || isRefetchingReviews}
                            >
                                {(isLoading || isRefetchingReviews) ? (
                                    <View style={styles.loadingButtonContent}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={styles.submitReviewText}>
                                            {isLoading ? 'Đang gửi...' : 'Đang tải...'}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.submitReviewText}>
                                        {isEditing ? 'Cập nhật' : 'Gửi đánh giá'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    };

    /**
     * Format ngày tháng theo định dạng tiếng Việt
     * @param {string} dateString - Chuỗi ngày từ API
     * @returns {string} Ngày đã format
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    /**
     * Tính tổng tiền của các items trong đơn hàng
     * @returns {number} Tổng tiền items
     */
    const calculateSubtotal = () => {
        return orderData?.items?.reduce((total, item) => total + item.subtotal, 0) || 0;
    };

    // Render main UI
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.secondary}
                translucent
            />

            {/* Header với gradient background */}
            <LinearGradient
                colors={COLORS.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <SafeAreaView>
                    <View style={styles.header}>
                        {/* Nút back */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        {/* Tiêu đề */}
                        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                        <View style={styles.headerSpacer} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Global Loading Overlay khi đang refetch reviews */}
            {isRefetchingReviews && (
                <View style={styles.globalLoadingOverlay}>
                    <View style={styles.globalLoadingContainer}>
                        <ActivityIndicator size="large" color={orderDataColor || '#1CD4D4'} />
                        <Text style={styles.globalLoadingText}>Đang cập nhật đánh giá...</Text>
                    </View>
                </View>
            )}

            {/* Nội dung chính - ScrollView */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Thông tin đơn hàng */}
                <View style={styles.orderInfo}>
                    {/* Header đơn hàng - ID và trạng thái */}
                    <View style={styles.orderHeader}>
                        <View>
                            <Text style={styles.orderNumber}>{`#ORD-${orderData?.order_id?.slice(-4).toUpperCase()}`}</Text>
                            <Text style={styles.orderDate}>{formatDate(orderData?.createdAt)}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            orderStatus === 'Đã giao' && styles.deliveredBadge,
                            { backgroundColor: orderDataBg || 'rgba(255, 184, 0, 0.1)' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                orderStatus === 'Đã giao' && styles.deliveredText,
                                { color: orderDataColor || '#FFB800' }
                            ]}>
                                {orderStatus}
                            </Text>
                        </View>
                    </View>

                    {/* Địa chỉ giao hàng */}
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressTitle}>Địa chỉ giao hàng</Text>
                        <Text style={styles.customerName}>{orderData?.receiver_name}</Text>
                        <Text style={styles.address}>
                            {orderData?.receiver_address}{'\n'}
                            Điện thoại: {orderData?.receiver_phone}
                        </Text>
                    </View>

                    {/* Danh sách sản phẩm */}
                    <View style={styles.productsContainer}>
                        {orderData?.items?.map((item, index) => (
                            <View key={item.product_id} style={styles.productCard}>
                                {/* Thông tin sản phẩm */}
                                <View style={styles.productInfo}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.productImage}
                                    />
                                    <View style={styles.productDetails}>
                                        <Text style={styles.productName}>{item.name}</Text>
                                        <Text style={styles.productVariant}>ID: {item.product_id.slice(-8)}</Text>
                                        <View style={styles.priceRow}>
                                            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                                            <Text style={styles.quantity}>SL: {item.quantity}</Text>
                                        </View>
                                        <Text style={[
                                            styles.subtotal,
                                            { color: orderDataColor || '#22C55E' }
                                        ]}>Tạm tính: {formatCurrency(item.subtotal)}</Text>
                                    </View>
                                </View>
                                {/* Section đánh giá sản phẩm */}
                                {renderRatingSection(item.product_id)}
                            </View>
                        ))}
                    </View>

                    {/* Tóm tắt đơn hàng - Tính tiền */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tạm tính</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal())}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                            <Text style={styles.summaryValue}>
                                {formatCurrency(Math.max(0, (orderData?.total_price || 0) - calculateSubtotal()))}
                            </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Tổng cộng</Text>
                            <Text style={styles.totalValue}>{formatCurrency(orderData?.total_price)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons - Hiển thị conditional dựa trên trạng thái */}
            {(orderStatus === 'Chờ xử lý' || orderStatus === 'Đã giao') && (
                <View style={styles.actionContainer}>
                    {/* Nút hủy đơn hàng (chỉ hiển thị khi chờ xử lý) */}
                    {orderStatus === 'Chờ xử lý' && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.cancelButton,
                                orderLoading && styles.disabledButton
                            ]}
                            onPress={handleCancelOrder}
                            disabled={orderLoading}
                        >
                            {orderLoading ? (
                                <View style={styles.loadingButtonContent}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Đang hủy...</Text>
                                </View>
                            ) : (
                                <Text style={styles.actionButtonText}>Hủy đơn hàng</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Nút trả hàng (chỉ hiển thị khi đã giao) */}
                    {/* {orderStatus === 'Đã giao' && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.returnButton,
                                orderLoading && styles.disabledButton
                            ]}
                            onPress={handleReturnOrder}
                            disabled={orderLoading}
                        >
                            {orderLoading ? (
                                <View style={styles.loadingButtonContent}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Đang trả hàng...</Text>
                                </View>
                            ) : (
                                <Text style={styles.actionButtonText}>Trả hàng</Text>
                            )}
                        </TouchableOpacity>
                    )} */}
                </View>
            )}
        </SafeAreaView>
    );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
    // Container chính
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // Header với gradient
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
    // Header content
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    // Nút back
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    // Tiêu đề header
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    // Spacer cho layout cân bằng
    headerSpacer: {
        width: 40,
    },
    // Nội dung chính
    content: {
        flex: 1,
    },
    // Container thông tin đơn hàng
    orderInfo: {
        padding: 16,
    },
    // Header đơn hàng (ID + status)
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    // Số đơn hàng
    orderNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    // Ngày đặt hàng
    orderDate: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    // Badge trạng thái
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 184, 0, 0.1)',
        borderRadius: 20,
    },
    deliveredBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    // Text trạng thái
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFB800',
    },
    deliveredText: {
        color: '#22C55E',
    },
    // Container địa chỉ
    addressContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    // Tiêu đề địa chỉ
    addressTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    // Tên khách hàng
    customerName: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 4,
    },
    // Địa chỉ
    address: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    // Container danh sách sản phẩm
    productsContainer: {
        marginBottom: 24,
    },
    // Card sản phẩm
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        marginBottom: 16,
    },
    // Thông tin sản phẩm
    productInfo: {
        flexDirection: 'row',
    },
    // Hình ảnh sản phẩm
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    // Chi tiết sản phẩm
    productDetails: {
        flex: 1,
    },
    // Tên sản phẩm
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 4,
    },
    // Variant sản phẩm
    productVariant: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    // Row giá và số lượng
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    // Giá sản phẩm
    price: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    // Số lượng
    quantity: {
        fontSize: 14,
        color: '#6B7280',
    },
    // Tạm tính
    subtotal: {
        fontSize: 14,
        fontWeight: '500',
        color: '#22C55E',
    },

    // STYLES CHO RATING SECTION
    // Section đánh giá
    ratingSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    // Tiêu đề rating
    ratingTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    // Container các ngôi sao
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    // Style ngôi sao
    star: {
        marginRight: 4,
    },
    // Ngôi sao disabled
    disabledStar: {
        opacity: 0.5,
    },
    // Input đánh giá
    reviewInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        textAlignVertical: 'top',
        minHeight: 80,
        marginBottom: 12,
    },
    // Container các nút review
    reviewButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    // Nút hủy
    cancelButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
    },
    // Nút submit review
    submitReviewButton: {
        flex: 2,
        backgroundColor: '#1CD4D4',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    submitButtonSmall: {
        marginBottom: 0,
    },
    // Nút disabled
    disabledButton: {
        opacity: 0.7,
    },
    // Text nút submit
    submitReviewText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    // Content loading button
    loadingButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    // Container review đã submit
    reviewedContainer: {
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    // Nội dung review existing
    existingReviewContent: {
        marginBottom: 12,
    },
    // Text review existing
    existingReviewText: {
        fontSize: 14,
        color: '#374151',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    // Actions của review
    reviewActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // Indicator đã submit
    submittedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Text đã submit
    submittedText: {
        color: '#22C55E',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    // Nút edit
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    // Container loading
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    // Global loading overlay
    globalLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    globalLoadingContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    globalLoadingText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },

    // STYLES CHO ORDER SUMMARY
    // Container tóm tắt
    summaryContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
    },
    // Row trong summary
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    // Label summary
    summaryLabel: {
        fontSize: 16,
        color: '#4B5563',
    },
    // Value summary
    summaryValue: {
        fontSize: 16,
        color: '#000',
    },
    // Row total
    totalRow: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginBottom: 0,
    },
    // Label total
    totalLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    // Value total
    totalValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },

    // STYLES CHO ACTION BUTTONS
    // Container action buttons
    actionContainer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    // Action button chung
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    // Nút hủy đơn hàng
    cancelButton: {
        backgroundColor: '#EF4444',
    },
    // Nút trả hàng
    returnButton: {
        backgroundColor: '#F59E0B',
    },
    // Text action button
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Button disabled
    disabledButton: {
        opacity: 0.6,
    },
});

export default OrderDetailsScreen;