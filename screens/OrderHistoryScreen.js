import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderHistoryScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('All Orders');

    const filters = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    const orders = [
        {
            id: '#ORD-7829',
            date: 'May 25, 2025',
            items: 2,
            total: 124.99,
            status: 'Delivered',
            statusColor: '#10b981',
            statusBg: '#ecfdf5',
            product: {
                name: 'Premium White Sneakers',
                details: 'Size: 42 | Color: White',
                price: 89.99,
                image: 'https://via.placeholder.com/64x64/f3f4f6/6b7280?text=Shoes',
            },
        },
        {
            id: '#ORD-6543',
            date: 'May 18, 2025',
            items: 1,
            total: 78.50,
            status: 'Shipped',
            statusColor: '#3b82f6',
            statusBg: '#eff6ff',
            product: {
                name: 'Classic Black Watch',
                details: 'Color: Black',
                price: 129.99,
                image: 'https://via.placeholder.com/64x64/f3f4f6/6b7280?text=Watch',
            },
        },
        {
            id: '#ORD-5421',
            date: 'May 10, 2025',
            items: 1,
            total: 249.99,
            status: 'Delivered',
            statusColor: '#10b981',
            statusBg: '#ecfdf5',
            product: {
                name: 'Casual Denim Jacket',
                details: 'Size: M | Color: Blue',
                price: 79.99,
                image: 'https://via.placeholder.com/64x64/f3f4f6/6b7280?text=Jacket',
            },
        },
        {
            id: '#ORD-4321',
            date: 'May 5, 2025',
            items: 1,
            total: 159.99,
            status: 'Cancelled',
            statusColor: '#6b7280',
            statusBg: '#f3f4f6',
            product: {
                name: 'Leather Messenger Bag',
                details: 'Color: Brown',
                price: 159.99,
                image: 'https://via.placeholder.com/64x64/f3f4f6/6b7280?text=Bag',
            },
        },
    ];

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

                {/* <View style={styles.ordersContainer}>
                    {orders.map((order) => (
                        <OrderItem key={order.id} order={order} />
                    ))}
                </View> */}
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
        whiteSpace: 'nowrap',
    },
    selectedFilterButtonText: {
        color: '#13c2c2',
    },
    ordersContainer: {
        gap: 16,
    },
});

export default OrderHistoryScreen;