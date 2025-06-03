import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
const PaymentScreen = ({ navigation }) => {
    const [selectedPayment, setSelectedPayment] = useState('cod');

    const orderSummary = {
        subtotal: 299.97,
        shipping: 4.99,
        tax: 24.00,
        total: 328.96,
    };

    const handlePlaceOrder = () => {
        Alert.alert(
            'Order Placed',
            'Your order has been placed successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('Profile'),
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Payment</Text>

            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.sectionContent}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${orderSummary.subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>${orderSummary.shipping}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>${orderSummary.tax}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>${orderSummary.total}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.sectionContent}>
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={24} color="#13c2c2" />
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressTitle}>Home</Text>
                                <Text style={styles.addressText}>
                                    123 Main Street, Apt 4B, New York, NY 10001
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                selectedPayment === 'cod' && styles.selectedPaymentOption
                            ]}
                            onPress={() => setSelectedPayment('cod')}
                        >
                            <View style={styles.paymentLeft}>
                                <View style={styles.radioButton}>
                                    {selectedPayment === 'cod' && <View style={styles.radioSelected} />}
                                </View>
                                <View style={styles.paymentInfo}>
                                    <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                                    <Text style={styles.paymentSubtitle}>Pay when you receive your order</Text>
                                </View>
                            </View>
                            <Ionicons name="cash-outline" size={32} color="#13c2c2" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.placeOrderContainer}>
                <TouchableOpacity
                    style={styles.placeOrderButton}
                    onPress={handlePlaceOrder}
                >
                    <Text style={styles.placeOrderButtonText}>Place Order</Text>
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
    section: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#0d364c',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sectionContent: {
        padding: 16,
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
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressInfo: {
        marginLeft: 12,
        flex: 1,
    },
    addressTitle: {
        fontWeight: '500',
        color: '#0d364c',
        marginBottom: 4,
    },
    addressText: {
        color: '#6b7280',
        fontSize: 14,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
    },
    selectedPaymentOption: {
        borderColor: '#13c2c2',
        backgroundColor: '#f0fdfd',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radioButton: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#13c2c2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioSelected: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#13c2c2',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        fontWeight: '500',
        color: '#0d364c',
        marginBottom: 2,
    },
    paymentSubtitle: {
        color: '#6b7280',
        fontSize: 12,
    },
    placeOrderContainer: {
        backgroundColor: 'white',
        padding: 16,
    },
    placeOrderButton: {
        backgroundColor: '#13c2c2',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
    },
});

export default PaymentScreen;