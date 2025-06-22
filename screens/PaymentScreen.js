import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, clearOrderState } from '../store/slices/orderSlice'; // Adjust path as needed

const PaymentScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [showEditModal, setShowEditModal] = useState(false);
    const [receiverInfo, setReceiverInfo] = useState({

    });

    // Temporary state for editing
    const [tempReceiverInfo, setTempReceiverInfo] = useState(receiverInfo);

    // Redux state
    const { isLoading, createSuccess, newOrderId, error } = useSelector(state => state.order);

    // Get data from navigation params or use default values
    const { selectedItems = [], orderSummary = null, selected_product_ids = [] } = route?.params || {};

    // Default order summary if not provided
    const defaultOrderSummary = {
        subtotal: 299.97,
        shipping: 0.00,
        tax: 24.00,
        total: 323.97,
    };

    const summary = orderSummary || defaultOrderSummary;

    const paymentMethods = [
        {
            id: 'cod',
            title: 'Cash on Delivery',
            subtitle: 'Pay when you receive your order',
            icon: 'cash-outline',
            available: true
        }
        // Other payment methods commented out as in original
    ];

    // Handle order creation success
    useEffect(() => {
        if (createSuccess && newOrderId) {
            Alert.alert(
                'Order Placed Successfully! 🎉',
                `Your order ID: ${newOrderId}\nYour order has been placed and will be processed soon.`,
                [
                    {
                        text: 'Continue Shopping',
                        style: 'cancel',
                        onPress: () => {
                            dispatch(clearOrderState());
                            navigation.navigate('HomePage');
                        },
                    },
                    {
                        text: 'View Orders',
                        onPress: () => {
                            dispatch(clearOrderState());
                            navigation.navigate('OrderHistory');
                        },
                    },
                ]
            );
        }
    }, [createSuccess, newOrderId, dispatch, navigation]);

    // Handle order creation error
    useEffect(() => {
        if (error) {
            Alert.alert(
                'Order Failed',
                error,
                [
                    {
                        text: 'Try Again',
                        onPress: () => dispatch(clearOrderState()),
                    },
                ]
            );
        }
    }, [error, dispatch]);

    const handleEditAddress = () => {
        setTempReceiverInfo(receiverInfo);
        setShowEditModal(true);
    };

    const handleSaveAddress = () => {
        // Validate required fields
        if (!tempReceiverInfo.receiver_name.trim()) {
            Alert.alert('Error', 'Please enter receiver name');
            return;
        }
        if (!tempReceiverInfo.receiver_phone.trim()) {
            Alert.alert('Error', 'Please enter receiver phone');
            return;
        }
        if (!tempReceiverInfo.receiver_address.trim()) {
            Alert.alert('Error', 'Please enter receiver address');
            return;
        }

        setReceiverInfo(tempReceiverInfo);
        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        setTempReceiverInfo(receiverInfo);
        setShowEditModal(false);
    };

    const handlePlaceOrder = () => {
        if (!selectedPayment) {
            Alert.alert(
                'Payment Method Required',
                'Please select a payment method to continue.',
                [{ text: 'OK' }]
            );
            return;
        }

        // Validate required data
        if (!selected_product_ids || selected_product_ids.length === 0) {
            Alert.alert(
                'No Products Selected',
                'Please select products before placing an order.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Confirm Order',
            `Place order with ${paymentMethods.find(m => m.id === selectedPayment)?.title}?\n\nTotal: $${summary.total.toFixed(2)}\nDelivery to: ${receiverInfo.receiver_address}`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Place Order',
                    style: 'default',
                    onPress: () => {

                        // Dispatch create order action
                        dispatch(createOrder({
                            selected_product_ids,
                            receiverInfo
                        }));
                    }
                },
            ]
        );
    };

    const renderEditAddressModal = () => (
        <Modal
            visible={showEditModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleCancelEdit}
        >
            <SafeAreaView style={styles.modalContainer}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={handleCancelEdit}
                        style={styles.modalHeaderButton}
                    >
                        <Icon name="close" size={24} color="#0d364c" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Edit Delivery Information</Text>
                    <TouchableOpacity
                        onPress={handleSaveAddress}
                        style={styles.modalHeaderButton}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    {/* Receiver Name */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Receiver Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={tempReceiverInfo.receiver_name}
                            onChangeText={(text) => setTempReceiverInfo(prev => ({
                                ...prev,
                                receiver_name: text
                            }))}
                            placeholder="Enter receiver name"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={tempReceiverInfo.receiver_phone}
                            onChangeText={(text) => setTempReceiverInfo(prev => ({
                                ...prev,
                                receiver_phone: text
                            }))}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Address */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Delivery Address *</Text>
                        <TextInput
                            style={[styles.textInput, styles.textAreaInput]}
                            value={tempReceiverInfo.receiver_address}
                            onChangeText={(text) => setTempReceiverInfo(prev => ({
                                ...prev,
                                receiver_address: text
                            }))}
                            placeholder="Enter full delivery address"
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Note */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Order Note (Optional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textAreaInput]}
                            value={tempReceiverInfo.note}
                            onChangeText={(text) => setTempReceiverInfo(prev => ({
                                ...prev,
                                note: text
                            }))}
                            placeholder="Add special instructions for delivery..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Info Note */}
                    <View style={styles.infoNote}>
                        <Icon name="info-outline" size={16} color="#6b7280" />
                        <Text style={styles.infoNoteText}>
                            Please ensure the delivery information is accurate to avoid any delivery issues.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Loading Overlay */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d364c" />
                        <Text style={styles.loadingText}>Creating your order...</Text>
                    </View>
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#0d364c" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="receipt" size={20} color="#0d364c" />
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${summary.subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={[styles.summaryValue, summary.shipping === 0 && styles.freeShipping]}>
                                {summary.shipping === 0 ? 'Free' : `$${summary.shipping.toFixed(2)}`}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>${summary.tax.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalDivider} />
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>${summary.total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Selected Items Summary */}
                {selectedItems && selectedItems.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="shopping-cart" size={20} color="#0d364c" />
                            <Text style={styles.sectionTitle}>
                                Items ({selectedItems.length})
                            </Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {selectedItems.slice(0, 3).map((item, index) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <Text style={styles.itemName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.itemQuantity}>
                                        x{item.quantity}
                                    </Text>
                                    <Text style={styles.itemPrice}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                            {selectedItems.length > 3 && (
                                <Text style={styles.moreItemsText}>
                                    and {selectedItems.length - 3} more item(s)...
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Delivery Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="location-on" size={20} color="#0d364c" />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <TouchableOpacity
                            style={styles.changeButton}
                            onPress={handleEditAddress}
                        >
                            <Text style={styles.changeButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <View style={styles.addressTypeContainer}>
                                    <Icon name="home" size={16} color="#0d364c" />
                                    <Text style={styles.addressType}>Home</Text>
                                </View>
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>Default</Text>
                                </View>
                            </View>
                            <Text style={styles.addressText}>
                                {receiverInfo.receiver_name}{'\n'}
                                {receiverInfo.receiver_address}
                            </Text>
                            <Text style={styles.phoneText}>{receiverInfo.receiver_phone}</Text>
                            {receiverInfo.note && (
                                <View style={styles.noteContainer}>
                                    <Icon name="note" size={14} color="#6b7280" />
                                    <Text style={styles.notePreview}>
                                        Note: {receiverInfo.note}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="payment" size={20} color="#0d364c" />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        {paymentMethods.map((method, index) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.paymentOption,
                                    selectedPayment === method.id && styles.selectedPaymentOption,
                                    !method.available && styles.disabledPaymentOption,
                                    index < paymentMethods.length - 1 && styles.paymentOptionBorder
                                ]}
                                onPress={() => method.available && setSelectedPayment(method.id)}
                                disabled={!method.available}
                            >
                                <View style={styles.paymentLeft}>
                                    <View style={[
                                        styles.radioButton,
                                        selectedPayment === method.id && styles.radioButtonSelected,
                                        !method.available && styles.radioButtonDisabled
                                    ]}>
                                        {selectedPayment === method.id && (
                                            <View style={styles.radioSelected} />
                                        )}
                                    </View>
                                    <View style={styles.paymentIconContainer}>
                                        <Ionicons
                                            name={method.icon}
                                            size={24}
                                            color={method.available ? "#0d364c" : "#d1d5db"}
                                        />
                                    </View>
                                    <View style={styles.paymentInfo}>
                                        <Text style={[
                                            styles.paymentTitle,
                                            !method.available && styles.disabledText
                                        ]}>
                                            {method.title}
                                        </Text>
                                        <Text style={[
                                            styles.paymentSubtitle,
                                            !method.available && styles.disabledText
                                        ]}>
                                            {method.subtitle}
                                        </Text>
                                    </View>
                                </View>
                                {!method.available && (
                                    <View style={styles.comingSoonBadge}>
                                        <Text style={styles.comingSoonText}>Coming Soon</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Order Notes */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="note" size={20} color="#0d364c" />
                        <Text style={styles.sectionTitle}>Order Notes</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.noteCard}>
                            <Icon name="info-outline" size={16} color="#6b7280" />
                            <Text style={styles.noteText}>
                                Your order will be carefully packed and delivered within 2-3 business days. Payment will be collected upon delivery.
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.placeOrderContainer}>
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        (!selectedPayment || isLoading) && styles.disabledButton
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={!selectedPayment || isLoading}
                >
                    <View style={styles.placeOrderContent}>
                        {isLoading ? (
                            <ActivityIndicator size={20} color="#ffffff" />
                        ) : (
                            <Icon name="shopping-bag" size={20} color="#ffffff" />
                        )}
                        <Text style={styles.placeOrderButtonText}>
                            {isLoading ? 'Processing...' : `Place Order • $${summary.total.toFixed(2)}`}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Edit Address Modal */}
            {renderEditAddressModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 150,
    },
    loadingText: {
        marginTop: 12,
        color: '#0d364c',
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0d364c',
    },
    content: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0d364c',
        marginLeft: 8,
        flex: 1,
    },
    changeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#f0fdfd',
        borderWidth: 1,
        borderColor: '#13c2c2',
    },
    changeButtonText: {
        color: '#13c2c2',
        fontSize: 12,
        fontWeight: '500',
    },
    sectionContent: {
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        color: '#6b7280',
        fontSize: 14,
    },
    summaryValue: {
        color: '#0d364c',
        fontSize: 14,
        fontWeight: '500',
    },
    freeShipping: {
        color: '#10b981',
        fontWeight: '600',
    },
    totalDivider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    },
    totalRow: {
        marginBottom: 0,
    },
    totalLabel: {
        fontWeight: '600',
        color: '#0d364c',
        fontSize: 16,
    },
    totalValue: {
        fontWeight: '700',
        color: '#0d364c',
        fontSize: 20,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemName: {
        flex: 1,
        color: '#0d364c',
        fontSize: 14,
        fontWeight: '500',
    },
    itemQuantity: {
        color: '#6b7280',
        fontSize: 14,
        marginHorizontal: 12,
        minWidth: 30,
        textAlign: 'center',
    },
    itemPrice: {
        color: '#0d364c',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 60,
        textAlign: 'right',
    },
    moreItemsText: {
        color: '#6b7280',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
    addressCard: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressType: {
        fontWeight: '600',
        color: '#0d364c',
        marginLeft: 6,
    },
    defaultBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    defaultBadgeText: {
        color: '#1d4ed8',
        fontSize: 10,
        fontWeight: '500',
    },
    addressText: {
        color: '#6b7280',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    phoneText: {
        color: '#0d364c',
        fontSize: 14,
        fontWeight: '500',
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    notePreview: {
        color: '#6b7280',
        fontSize: 12,
        marginLeft: 6,
        flex: 1,
        fontStyle: 'italic',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    paymentOptionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    selectedPaymentOption: {
        backgroundColor: '#f0fdfd',
        marginHorizontal: -16,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    disabledPaymentOption: {
        opacity: 0.6,
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
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioButtonSelected: {
        borderColor: '#13c2c2',
    },
    radioButtonDisabled: {
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#13c2c2',
    },
    paymentIconContainer: {
        marginRight: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        fontWeight: '600',
        color: '#0d364c',
        fontSize: 16,
        marginBottom: 2,
    },
    paymentSubtitle: {
        color: '#6b7280',
        fontSize: 12,
    },
    disabledText: {
        color: '#d1d5db',
    },
    comingSoonBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    comingSoonText: {
        color: '#d97706',
        fontSize: 10,
        fontWeight: '500',
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#0ea5e9',
    },
    noteText: {
        color: '#0f172a',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 32,
    },
    placeOrderContainer: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
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
    placeOrderButton: {
        backgroundColor: '#0d364c',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#0d364c',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    disabledButton: {
        backgroundColor: '#d1d5db',
        shadowOpacity: 0,
        elevation: 0,
    },
    placeOrderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalHeaderButton: {
        width: 50,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0d364c',
        flex: 1,
        textAlign: 'center',
    },
    saveButtonText: {
        color: '#13c2c2',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0d364c',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0d364c',
        backgroundColor: '#ffffff',
    },
    textAreaInput: {
        height: 80,
        paddingTop: 12,
    },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#0ea5e9',
        marginTop: 20,
    },
    infoNoteText: {
        color: '#0f172a',
        fontSize: 12,
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
});
export default PaymentScreen;