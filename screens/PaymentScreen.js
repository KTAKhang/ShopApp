import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    TextInput,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { createOrderAsync } from '../store/slices/orderSlice';
import { COLORS } from '../constants/colors';

const PaymentScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { cart } = useSelector((state) => state.cart);
    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [receiverInfo, setReceiverInfo] = useState({
        receiver_name: '',
        receiver_phone: '',
        receiver_address: '',
    });

    const orderSummary = {
        subtotal: cart?.sum ? cart.sum / 1000 : 0,
        shipping: 0,
        tax: cart?.sum ? (cart.sum / 1000) * 0.1 : 0, // 10% tax
        total: cart?.sum ? (cart.sum / 1000) * 1.1 : 0, // subtotal + tax
    };

    const handlePlaceOrder = async () => {
        if (!receiverInfo.receiver_name || !receiverInfo.receiver_phone || !receiverInfo.receiver_address) {
            Alert.alert('Error', 'Please fill in all delivery information');
            return;
        }

        try {
            const selected_product_ids = cart.items.map(item => item.product_id);
            await dispatch(createOrderAsync({
                selected_product_ids,
                receiverInfo
            })).unwrap();

            Alert.alert(
                'Success',
                'Order placed successfully!',
                [{ text: 'OK', onPress: () => navigation.navigate('Profile') }]
            );
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to place order');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.sectionContent}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${orderSummary.subtotal.toFixed(3)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>${orderSummary.shipping.toFixed(3)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax (10%)</Text>
                            <Text style={styles.summaryValue}>${orderSummary.tax.toFixed(3)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>${orderSummary.total.toFixed(3)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Information</Text>
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={receiverInfo.receiver_name}
                            onChangeText={(text) => setReceiverInfo(prev => ({ ...prev, receiver_name: text }))}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                            value={receiverInfo.receiver_phone}
                            onChangeText={(text) => setReceiverInfo(prev => ({ ...prev, receiver_phone: text }))}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Delivery Address"
                            multiline
                            value={receiverInfo.receiver_address}
                            onChangeText={(text) => setReceiverInfo(prev => ({ ...prev, receiver_address: text }))}
                        />
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
                            <Icon name="payments" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={handlePlaceOrder}
            >
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    scrollContent: {
        padding: 16,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.primary,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.light,
    },
    sectionContent: {
        padding: 16,
    },
    formContainer: {
        padding: 16,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 16,
        color: COLORS.text.primary,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: COLORS.text.secondary,
        fontSize: 14,
    },
    summaryValue: {
        color: COLORS.text.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border.light,
        paddingTop: 8,
        marginTop: 8,
    },
    totalLabel: {
        fontWeight: '600',
        color: COLORS.text.primary,
        fontSize: 16,
    },
    totalValue: {
        fontWeight: '700',
        color: COLORS.primary,
        fontSize: 18,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border.light,
        borderRadius: 8,
    },
    selectedPaymentOption: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}10`,
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        fontWeight: '500',
        color: COLORS.text.primary,
        fontSize: 16,
    },
    paymentSubtitle: {
        color: COLORS.text.secondary,
        fontSize: 12,
        marginTop: 2,
    },
    placeOrderButton: {
        backgroundColor: COLORS.primary,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PaymentScreen;