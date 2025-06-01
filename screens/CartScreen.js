import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

// import CartItem from '../components/CartItem';

const CartScreen = ({ navigation }) => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Premium White Sneakers',
            price: 89.99,
            image: 'https://via.placeholder.com/80x80/f3f4f6/6b7280?text=Sneakers',
            size: '42',
            color: 'White',
            quantity: 1,
        },
        {
            id: 2,
            name: 'Classic Black Watch',
            price: 129.99,
            image: 'https://via.placeholder.com/80x80/f3f4f6/6b7280?text=Watch',
            color: 'Black',
            quantity: 1,
        },
        {
            id: 3,
            name: 'Casual Denim Jacket',
            price: 79.99,
            image: 'https://via.placeholder.com/80x80/f3f4f6/6b7280?text=Jacket',
            size: 'M',
            color: 'Blue',
            quantity: 1,
        },
    ]);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity > 0) {
            setCartItems(items =>
                items.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 4.99;
    const tax = 24.00;
    const total = subtotal + shipping + tax;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Cart 3</Text>

            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* <View style={styles.cartItemsContainer}>
                    {cartItems.map(item => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeItem}
                        />
                    ))}
                </View> */}

                <View style={styles.couponContainer}>
                    <View style={styles.couponInputContainer}>
                        <TextInput
                            style={styles.couponInput}
                            placeholder="Enter coupon code"
                            placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity style={styles.applyButton}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax</Text>
                        <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.checkoutContainer}>
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => navigation.navigate('Payment')}
                >
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
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
    cartItemsContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 16,
    },
    couponContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    couponInputContainer: {
        flexDirection: 'row',
    },
    couponInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
    },
    applyButton: {
        backgroundColor: '#13c2c2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    summaryContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#0d364c',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: '#6b7280',
    },
    summaryValue: {
        color: '#0d364c',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 8,
        marginTop: 8,
    },
    totalLabel: {
        fontWeight: '500',
        color: '#0d364c',
    },
    totalValue: {
        fontWeight: '500',
        color: '#0d364c',
        fontSize: 18,
    },
    checkoutContainer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: 16,
    },
    checkoutButton: {
        backgroundColor: '#0d364c',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
    },
});
export default CartScreen;