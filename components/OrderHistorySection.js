import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OrderHistorySection = ({ orderHistory, onViewAll, onOrderPress }) => {

    const simplifiedOrders = orderHistory.map(order => ({
        order_id: order.order_id,
        createdAt: order.createdAt,
        total_price: order.total_price,
        order_status_name: order.order_status.name
    }));


    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };


    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('vi-VN');
    };


    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING':
                return { backgroundColor: '#fff7cd', color: '#facc15' };
            case 'CONFIRMED':
                return { backgroundColor: '#e0f2fe', color: '#0284c7' };
            case 'SHIPPED':
                return { backgroundColor: '#ede9fe', color: '#7c3aed' };
            case 'DELIVERED':
                return { backgroundColor: '#dcfce7', color: '#22c55e' };
            case 'CANCELLED':
                return { backgroundColor: '#fee2e2', color: '#ef4444' };
            case 'RETURNED':
                return { backgroundColor: '#fef3c7', color: '#d97706' };
            default:
                return { backgroundColor: '#e5e7eb', color: '#6b7280' };
        }
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Order History</Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>
            {simplifiedOrders.map((order, index) => {
                const { backgroundColor, color } = getStatusStyle(order.order_status_name);
                return (
                    <TouchableOpacity
                        key={order.order_id}
                        onPress={() => onOrderPress(order)}
                        style={[
                            styles.orderItem,
                            index === simplifiedOrders.length - 1 && { borderBottomWidth: 0 }
                        ]}
                    >
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderId}>#{order.order_id}</Text>
                            <View style={[styles.statusBadge, { backgroundColor }]}>
                                <Text style={[styles.statusText, { color }]}>
                                    {order.order_status_name}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.orderFooter}>
                            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                            <Text style={styles.orderAmount}>{formatCurrency(order.total_price)}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151'
    },
    viewAllText: {
        color: '#13C2C2',
        fontWeight: '500',
        fontSize: 14
    },
    orderItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6'
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151'
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500'
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    orderDate: {
        fontSize: 14,
        color: '#6b7280'
    },
    orderAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151'
    },
});

export default OrderHistorySection;
