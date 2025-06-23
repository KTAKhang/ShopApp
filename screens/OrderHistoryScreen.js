import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    StatusBar,
    Alert,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../components/BottomNavigation';
import { fetchOrderByUser, cancelOrder, clearOrderState, } from '../store/slices/orderSlice';



const OrderHistoryScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('All Orders');
    const [cancellingOrders, setCancellingOrders] = useState(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const [isScrollLoading, setIsScrollLoading] = useState(false);

    const filters = ['All Orders', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

    const {
        orders: orderData,
        isLoading: orderLoading,
        isLoadingMore,
        error: orderError,
        cancelSuccess,
        cancelMessage,
        currentPage,
        hasMore,
        total
    } = useSelector((state) => state.order);

    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(fetchOrderByUser({ page: 1, limit: 5 }));
    }, [dispatch]);

    // Handle cancel success
    useEffect(() => {
        if (cancelSuccess && cancelMessage) {
            Alert.alert('Success', cancelMessage);
        }
    }, [cancelSuccess, cancelMessage]);

    // Cải tiến hàm onRefresh để pull-to-refresh
    const onRefresh = useCallback(async () => {

        setRefreshing(true);
        setIsScrollLoading(false); // Reset scroll loading state

        try {
            // Reset pagination về trang đầu tiên TRƯỚC khi gọi API
            dispatch(fetchOrderByUser());


            // Gọi API để load lại orders từ trang 1
            const result = await dispatch(fetchOrderByUser({
                page: 1,
                limit: 5,
                refresh: true // Thêm flag để distinguish refresh vs normal load
            })).unwrap();


        } catch (error) {
            console.error('❌ Pull to refresh failed:', error);
            Alert.alert('Error', 'Failed to refresh orders. Please try again.');
        } finally {
            setRefreshing(false);

        }
    }, [dispatch, refreshing, orderLoading, orderData, currentPage, hasMore, total]);

    // Load more handler with better logic
    const loadMoreOrders = useCallback(() => {

        // Kiểm tra các điều kiện chặt chẽ hơn
        if (
            !isLoadingMore &&
            hasMore &&
            !orderLoading &&
            !isScrollLoading &&
            orderData &&
            orderData.length > 0 &&
            orderData.length < total
        ) {
            setIsScrollLoading(true);

            dispatch(fetchOrderByUser({
                page: currentPage + 1,
                limit: 5,
                isLoadMore: true
            })).finally(() => {
                setIsScrollLoading(false);
            });
        }
    }, [dispatch, currentPage, hasMore, isLoadingMore, orderLoading, isScrollLoading, orderData, total]);

    const handleScroll = useCallback((event) => {
        // ✅ Kiểm tra event hợp lệ
        if (!event?.nativeEvent?.layoutMeasurement) {
            return;
        }

        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

        // ✅ Tránh bounce scroll và kiểm tra điều kiện
        if (
            contentOffset.y < 0 || // Tránh bounce scroll
            !hasMore ||
            isLoadingMore ||
            orderLoading
        ) {
            return;
        }

        const paddingToBottom = 100;
        const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        const hasEnoughContent = contentSize.height > layoutMeasurement.height;

        if (isNearBottom && hasEnoughContent) {

            loadMoreOrders();
        }
    }, [hasMore, isLoadingMore, orderLoading, loadMoreOrders]);

    // Stop loading when all items are loaded
    useEffect(() => {
        if (orderData && orderData.length >= total && total > 0) {
            setIsScrollLoading(false);
        }
    }, [orderData?.length, total]);

    // Transform API data to match UI format
    const transformOrderData = (apiOrders) => {
        if (!apiOrders || !Array.isArray(apiOrders)) return [];

        return apiOrders.map((order, index) => {
            // Map order status names to display format
            const statusMapping = {
                'PENDING': 'Pending',
                'CONFIRMED': 'Confirmed',
                'SHIPPED': 'Shipped',
                'DELIVERED': 'Delivered',
                'CANCELLED': 'Cancelled',
                'RETURNED': 'Returned'
            };

            // Map status to colors
            const statusColors = {
                'Pending': { color: '#f59e0b', bg: '#fffbeb' },
                'Confirmed': { color: '#8b5cf6', bg: '#f3e8ff' },
                'Shipped': { color: '#3b82f6', bg: '#eff6ff' },
                'Delivered': { color: '#10b981', bg: '#ecfdf5' },
                'Cancelled': { color: '#6b7280', bg: '#f3f4f6' },
                'Returned': { color: '#ef4444', bg: '#fef2f2' }
            };

            const status = statusMapping[order.order_status?.name] || 'Pending';
            const statusColor = statusColors[status] || statusColors['Pending'];

            // Format date
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            };

            // Get first item for display
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

            return {
                id: `#ORD-${order.order_id.slice(-4).toUpperCase()}`,
                orderId: order.order_id,
                date: formatDate(order.createdAt),
                items: order.items ? order.items.length : 1,
                total: (order.total_price / 1000).toFixed(2),
                status: status,
                statusColor: statusColor.color,
                statusBg: statusColor.bg,
                product: {
                    name: firstItem?.product_name || firstItem?.name || 'Product',
                    details: `Receiver: ${order.receiver_name}`,
                    price: firstItem?.price ? (firstItem.price / 1000).toFixed(2) : (order.total_price / 1000).toFixed(2),
                    image: firstItem?.image || 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747706328/avatars/mfwbvrkvqcsv6kgze587.png',
                },
                originalOrder: order
            };
        });
    };

    const orders = transformOrderData(orderData);

    // Filter orders based on selected filter
    const filteredOrders = orders.filter(order => {
        if (selectedFilter === 'All Orders') return true;
        return order.status === selectedFilter;
    });

    // Handle cancel order
    const handleCancelOrder = (order) => {
        Alert.alert(
            'Cancel Order',
            `Are you sure you want to cancel order ${order.id}?`,
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCancellingOrders(prev => new Set([...prev, order.orderId]));
                            await dispatch(cancelOrder(order.orderId)).unwrap();
                        } catch (error) {
                            Alert.alert('Error', error || 'Failed to cancel order');
                        } finally {
                            setCancellingOrders(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(order.orderId);
                                return newSet;
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleActionPress = (order) => {
        switch (order.status) {
            case 'Pending':
                handleCancelOrder(order);
                break;
            case 'Delivered':
                navigation.navigate('OrderDetails', {
                    orderData: order.originalOrder,
                    orderDataColor: order.statusColor,
                    orderDataBg: order.statusBg
                });
                break;
            default:
                navigation.navigate('OrderDetails', {
                    orderData: order.originalOrder,
                    orderDataColor: order.statusColor,
                    orderDataBg: order.statusBg
                });
                break;
        }
    };

    const OrderItem = ({ order }) => {
        const isCancelling = cancellingOrders.has(order.orderId);

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetails', {
                    orderData: order.originalOrder,
                    orderDataColor: order.statusColor,
                    orderDataBg: order.statusBg
                })}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderId}>{order.id}</Text>
                        <Text style={styles.orderDate}>{order.date}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: order.statusBg }]}>
                        <Text style={[styles.statusText, { color: order.statusColor }]}>
                            {order.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.productContainer}>
                    <Image source={{ uri: order.product.image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{order.product.name}</Text>
                        <Text style={styles.productDetails}>{order.product.details}</Text>
                        <View style={styles.productPricing}>
                            <Text style={styles.productPrice}>${order.product.price}</Text>
                            {order.items > 1 && (
                                <Text style={styles.itemCount}>+{order.items - 1} more item{order.items > 2 ? 's' : ''}</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.orderFooter}>
                    <View style={styles.orderTotal}>
                        <Text style={styles.totalLabel}>Total: </Text>
                        <Text style={styles.totalAmount}>${order.total}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            order.status === 'Pending' && styles.cancelButton,
                            isCancelling && styles.disabledButton
                        ]}
                        onPress={() => handleActionPress(order)}
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <View style={styles.cancellingContainer}>
                                <ActivityIndicator size="small" color="white" />
                                <Text style={[styles.actionButtonText, { marginLeft: 8 }]}>
                                    Cancelling...
                                </Text>
                            </View>
                        ) : (
                            <Text style={[
                                styles.actionButtonText,
                                order.status === 'Pending' && styles.cancelButtonText
                            ]}>
                                {order.status === 'Delivered' ? 'Rating' :
                                    order.status === 'Pending' ? 'Cancel Order' :
                                        order.status === 'Returned' ? 'View Details' :
                                            'View Details'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // Loading footer component
    const LoadingFooter = () => {
        if (!isLoadingMore && !isScrollLoading) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingFooterText}>Loading more orders...</Text>
            </View>
        );
    };

    // No more items footer
    const NoMoreFooter = () => {
        if (hasMore || orders.length === 0) return null;

        return (
            <View style={styles.noMoreFooter}>
                <Text style={styles.noMoreText}>No more orders to load</Text>
                <Text style={styles.totalOrdersText}>Total: {total} orders</Text>
            </View>
        );
    };

    // Initial loading state
    if (orderLoading && !orderData?.length) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
                <LinearGradient
                    colors={COLORS.gradient.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Order History</Text>
                    </View>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
                <BottomNavigation />
            </SafeAreaView>
        );
    }

    // Error state
    if (orderError && !orderData?.length) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
                <LinearGradient
                    colors={COLORS.gradient.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Order History</Text>
                    </View>
                </LinearGradient>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={64} color={COLORS.error} />
                    <Text style={styles.errorTitle}>Failed to load orders</Text>
                    <Text style={styles.errorSubtitle}>{orderError}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(fetchOrderByUser({ page: 1, limit: 5 }))}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
                <BottomNavigation />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
            <LinearGradient
                colors={COLORS.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Order History</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
                onScroll={handleScroll}
                scrollEventThrottle={400} // Giảm từ 1000 xuống 400 để responsive hơn
                bounces={true} // Cho phép bounce effect trên iOS
                alwaysBounceVertical={true} // Luôn cho phép bounce vertical
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary, COLORS.secondary]} // Android - nhiều màu
                        tintColor={COLORS.primary} // iOS
                        title="Pull to refresh orders" // iOS
                        titleColor={COLORS.textPrimary || '#333'} // iOS
                        progressBackgroundColor="#ffffff" // Android
                        size="default" // Android
                        enabled={true} // Đảm bảo RefreshControl được enable
                    />
                }
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter && styles.selectedFilterButton,
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedFilter === filter && styles.selectedFilterButtonText,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.ordersContainer}>
                    {filteredOrders.length > 0 ? (
                        <>
                            {filteredOrders.map((order) => (
                                <OrderItem key={order.id} order={order} />
                            ))}
                            <LoadingFooter />
                            <NoMoreFooter />
                        </>
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="shopping-bag" size={64} color="#d1d5db" />
                            <Text style={styles.emptyStateTitle}>No orders found</Text>
                            <Text style={styles.emptyStateSubtitle}>
                                {orders.length === 0
                                    ? "You haven't placed any orders yet"
                                    : "No orders match the selected filter"
                                }
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            <BottomNavigation />
        </SafeAreaView>
    );
};
// Styles (giữ nguyên styles cũ của bạn)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerGradient: {
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    filterContainer: {
        marginVertical: 15,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    selectedFilterButton: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterButtonText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    selectedFilterButtonText: {
        color: 'white',
    },
    ordersContainer: {
        flex: 1,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    orderDate: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    productContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    productDetails: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    productPricing: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    itemCount: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 8,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderTotal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cancelButton: {
        backgroundColor: '#ef4444',
    },
    disabledButton: {
        opacity: 0.6,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: 'white',
    },
    cancellingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingFooterText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#6b7280',
    },
    noMoreFooter: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noMoreText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    totalOrdersText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4b5563',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ef4444',
        marginTop: 16,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); ``

export default OrderHistoryScreen;