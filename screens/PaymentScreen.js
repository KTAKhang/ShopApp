import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderByUser, cancelOrder, clearOrderState } from '../store/slices/orderSlice';

const OrderHistoryScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('All Orders');
    const [cancellingOrders, setCancellingOrders] = useState(new Set());

    const filters = ['All Orders', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    const {
        orders: orderData,
        isLoading: orderLoading,
        error: orderError,
        cancelSuccess,
        cancelMessage
    } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchOrderByUser());
    }, [dispatch]);

    // Handle cancel success
    useEffect(() => {
        if (cancelSuccess && cancelMessage) {
            Alert.alert('Success', cancelMessage);
            // Refresh orders after successful cancellation
            dispatch(clearOrderState());
            dispatch(fetchOrderByUser());
        }
    }, [cancelSuccess, cancelMessage, dispatch]);

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

            // Get first item for display (assuming items is an array)
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

            return {
                id: `#ORD-${order.order_id.slice(-4).toUpperCase()}`,
                orderId: order.order_id, // Keep the full order ID for API calls
                date: formatDate(order.createdAt),
                items: order.items ? order.items.length : 1,
                total: (order.total_price / 1000).toFixed(2), // Convert from VND to display format
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

    // Handle action button press
    const handleActionPress = (order) => {
        switch (order.status) {
            case 'Pending':
                handleCancelOrder(order);
                break;
            case 'Delivered':
                // Navigate to rating screen
                navigation.navigate('OrderDetails', {
                    orderData: order.originalOrder,
                    orderDataColor: order.statusColor,
                    orderDataBg: order.statusBg
                });
                break;
            default:
                // Navigate to order details
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

    // Loading state
    if (orderLoading && !orderData.length) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order History</Text>
                    <View style={styles.headerButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#13c2c2" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (orderError && !orderData.length) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order History</Text>
                    <View style={styles.headerButton} />
                </View>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Failed to load orders</Text>
                    <Text style={styles.errorSubtitle}>{orderError}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(fetchOrderByUser())}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Order History</Text>

                <View style={styles.headerButton} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                        filteredOrders.map((order) => (
                            <OrderItem key={order.id} order={order} />
                        ))
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
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
        color: '#111827',
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
        backgroundColor: '#13c2c2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    filterContainer: {
        marginTop: 16,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: 'white',
    },
    selectedFilterButton: {
        backgroundColor: '#e6fffa',
        borderColor: '#13c2c2',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    selectedFilterButtonText: {
        color: '#13c2c2',
    },
    ordersContainer: {
        paddingBottom: 20,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    productContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    productDetails: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    productPricing: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginRight: 8,
    },
    itemCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    orderTotal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        color: '#6b7280',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    actionButton: {
        backgroundColor: '#13c2c2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#ef4444',
    },
    disabledButton: {
        opacity: 0.6,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    cancelButtonText: {
        color: 'white',
    },
    cancellingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});

export default OrderHistoryScreen;