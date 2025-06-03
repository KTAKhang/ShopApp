import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, clearReviewState } from '../store/slices/reviewSlice';

const OrderDetailsScreen = ({ navigation }) => {
    const route = useRoute();
    const { orderData, orderDataColor, orderDataBg } = route.params;

    const dispatch = useDispatch();
    const { isLoading, error, successMessage } = useSelector((state) => state.review);

    const [orderStatus, setOrderStatus] = useState(orderData?.order_status?.name || 'PENDING');

    const initialRatings = {};
    const initialReviews = {};
    const initialSubmittedReviews = {};

    orderData?.items?.forEach((item, index) => {
        initialRatings[item.product_id] = 0;
        initialReviews[item.product_id] = '';
        initialSubmittedReviews[item.product_id] = false;
    });

    const [ratings, setRatings] = useState(initialRatings);
    const [reviews, setReviews] = useState(initialReviews);
    const [submittedReviews, setSubmittedReviews] = useState(initialSubmittedReviews);

    // Handle success/error messages
    useEffect(() => {
        if (successMessage && !isLoading && !error) {
            Alert.alert(
                'Success',
                'Review submitted successfully!',
                [{ text: 'OK', onPress: () => dispatch(clearReviewState()) }]
            );
        }

        if (error && !isLoading) {
            Alert.alert(
                'Error',
                error,
                [{ text: 'OK', onPress: () => dispatch(clearReviewState()) }]
            );
        }
    }, [successMessage, error, isLoading, dispatch]);

    const handleStarPress = (productId, starIndex) => {
        if (orderStatus === 'DELIVERED' && !submittedReviews[productId]) {
            setRatings(prev => ({
                ...prev,
                [productId]: starIndex + 1,
            }));
        }
    };

    const handleSubmitReview = async (productId) => {
        const rating = ratings[productId];
        const reviewContent = reviews[productId].trim();

        // Validation
        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }

        if (!reviewContent) {
            Alert.alert('Error', 'Please write a review');
            return;
        }

        // Find the item to get order_details_id
        const item = orderData?.items?.find(item => item.product_id === productId);
        if (!item) {
            Alert.alert('Error', 'Product not found');
            return;
        }

        if (!item.order_details_id) {
            Alert.alert('Error', 'Order details ID not found');
            return;
        }

        try {
            // Dispatch the review creation
            const result = await dispatch(createReview({
                product_id: productId,
                order_detail_id: item.order_details_id,
                rating: rating,
                review_content: reviewContent,
            }));

            // If successful, mark as submitted
            if (createReview.fulfilled.match(result)) {
                setSubmittedReviews(prev => ({
                    ...prev,
                    [productId]: true,
                }));
            }
        } catch (error) {
            console.error('Submit review error:', error);
        }
    };

    const renderStars = (productId) => {
        const currentRating = ratings[productId];
        const isSubmitted = submittedReviews[productId];

        return (
            <View style={styles.starsContainer}>
                {[...Array(5)].map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleStarPress(productId, index)}
                        disabled={orderStatus !== 'DELIVERED' || isSubmitted}
                    >
                        <Icon
                            name={index < currentRating ? 'star' : 'star-border'}
                            size={24}
                            color={index < currentRating ? (orderDataColor || '#FFB800') : '#D1D5DB'}
                            style={[
                                styles.star,
                                (orderStatus !== 'DELIVERED' || isSubmitted) && styles.disabledStar
                            ]}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderRatingSection = (productId) => {
        if (orderStatus !== 'DELIVERED') return null;

        const isSubmitted = submittedReviews[productId];

        return (
            <View style={styles.ratingSection}>
                <Text style={styles.ratingTitle}>
                    {isSubmitted ? 'Review Submitted' : 'Rate this product'}
                </Text>
                {renderStars(productId)}
                <TextInput
                    style={[
                        styles.reviewInput,
                        { borderColor: orderDataColor || '#D1D5DB' },
                        isSubmitted && styles.disabledInput
                    ]}
                    placeholder={isSubmitted ? 'Thank you for your review!' : 'Write your review here...'}
                    multiline
                    numberOfLines={3}
                    value={reviews[productId]}
                    onChangeText={(text) => {
                        if (!isSubmitted) {
                            setReviews(prev => ({
                                ...prev,
                                [productId]: text,
                            }));
                        }
                    }}
                    editable={!isSubmitted}
                />
                {!isSubmitted && (
                    <TouchableOpacity
                        style={[
                            styles.submitReviewButton,
                            { backgroundColor: orderDataColor || '#1CD4D4' },
                            isLoading && styles.disabledButton
                        ]}
                        onPress={() => handleSubmitReview(productId)}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitReviewText}>
                            {isLoading ? 'Submitting...' : 'Submit Review'}
                        </Text>
                    </TouchableOpacity>
                )}
                {isSubmitted && (
                    <View style={styles.submittedIndicator}>
                        <Icon name="check-circle" size={20} color="#22C55E" />
                        <Text style={styles.submittedText}>Review submitted successfully!</Text>
                    </View>
                )}
            </View>
        );
    };

    // Format số tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format ngày
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Tính tổng tiền items
    const calculateSubtotal = () => {
        return orderData?.items?.reduce((total, item) => total + item.subtotal, 0) || 0;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Info */}
                <View style={styles.orderInfo}>
                    <View style={styles.orderHeader}>
                        <View>
                            <Text style={styles.orderNumber}>{`#ORD-${orderData?.order_id?.slice(-4).toUpperCase()}`}</Text>
                            <Text style={styles.orderDate}>{formatDate(orderData?.createdAt)}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            orderStatus === 'DELIVERED' && styles.deliveredBadge,
                            { backgroundColor: orderDataBg || 'rgba(255, 184, 0, 0.1)' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                orderStatus === 'DELIVERED' && styles.deliveredText,
                                { color: orderDataColor || '#FFB800' }
                            ]}>
                                {orderData?.order_status?.name || orderStatus}
                            </Text>
                        </View>
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressTitle}>Delivery Address</Text>
                        <Text style={styles.customerName}>{orderData?.receiver_name}</Text>
                        <Text style={styles.address}>
                            {orderData?.receiver_address}{'\n'}
                            Phone: {orderData?.receiver_phone}
                        </Text>
                    </View>

                    {/* Products */}
                    <View style={styles.productsContainer}>
                        {orderData?.items?.map((item, index) => (
                            <View key={item.product_id} style={styles.productCard}>
                                <View style={styles.productInfo}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.productImage}
                                    />
                                    <View style={styles.productDetails}>
                                        <Text style={styles.productName}>{item.name}</Text>
                                        <Text style={styles.productVariant}>ID: {item.product_id.slice(-8)}</Text>
                                        <View style={styles.priceRow}>
                                            <Text style={styles.price}>{formatPrice(item.price)}</Text>
                                            <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                                        </View>
                                        <Text style={[
                                            styles.subtotal,
                                            { color: orderDataColor || '#22C55E' }
                                        ]}>Subtotal: {formatPrice(item.subtotal)}</Text>
                                    </View>
                                </View>
                                {renderRatingSection(item.product_id)}
                            </View>
                        ))}
                    </View>

                    {/* Order Summary */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatPrice(calculateSubtotal())}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping Fee</Text>
                            <Text style={styles.summaryValue}>
                                {formatPrice(Math.max(0, (orderData?.total_price || 0) - calculateSubtotal()))}
                            </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{formatPrice(orderData?.total_price)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>Need Help?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[
                    styles.trackButton,
                    { backgroundColor: orderDataColor || '#1CD4D4' }
                ]}>
                    <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    orderInfo: {
        padding: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    orderDate: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 184, 0, 0.1)',
        borderRadius: 20,
    },
    deliveredBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFB800',
    },
    deliveredText: {
        color: '#22C55E',
    },
    addressContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    customerName: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    productsContainer: {
        marginBottom: 24,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        marginBottom: 16,
    },
    productInfo: {
        flexDirection: 'row',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 4,
    },
    productVariant: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    quantity: {
        fontSize: 14,
        color: '#6B7280',
    },
    subtotal: {
        fontSize: 14,
        fontWeight: '500',
        color: '#22C55E',
    },
    ratingSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    ratingTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    star: {
        marginRight: 4,
    },
    disabledStar: {
        opacity: 0.5,
    },
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
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
    },
    submitReviewButton: {
        backgroundColor: '#1CD4D4',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitReviewText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    submittedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    submittedText: {
        color: '#22C55E',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    summaryContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#4B5563',
    },
    summaryValue: {
        fontSize: 16,
        color: '#000',
    },
    totalRow: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    helpButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        alignItems: 'center',
    },
    helpButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    trackButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#1CD4D4',
        borderRadius: 8,
        alignItems: 'center',
    },
    trackButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
});

export default OrderDetailsScreen;