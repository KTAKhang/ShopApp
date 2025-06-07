import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Alert,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartByUser, updateCartItem, removeCartItem } from '../store/slices/cartSlice';
import { COLORS } from '../constants/colors';
import BottomNavigation from '../components/BottomNavigation';

const CartScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { cart, isLoading, error } = useSelector((state) => state.cart);

    // Transform cart data to match UI expectations
    const [cartItems, setCartItems] = useState([]);
    const [editingQuantity, setEditingQuantity] = useState({}); // Track which items are being edited
    const [isUpdating, setIsUpdating] = useState({}); // Track updating state for individual items

    useEffect(() => {
        dispatch(fetchCartByUser());
    }, [dispatch]);

    // Update cartItems when cart data changes
    useEffect(() => {
        if (cart && cart.items) {
            const transformedItems = cart.items.map(item => ({
                id: item.product_id,
                name: item.name,
                price: item.price / 1000,
                image: item.image,
                quantity: item.quantity,
                size: null,
                color: 'Default',
                subtotal: item.subtotal,
                in_stock: item.in_stock,
                is_available: item.is_available
            }));
            setCartItems(transformedItems);
        }
    }, [cart]);

    // Updated updateQuantity function to use Redux action (for +/- buttons)
    const updateQuantity = async (product_id, newQuantity) => {
        const quantity = parseInt(newQuantity);

        if (quantity > 0) {
            // Set updating state for this specific item
            setIsUpdating(prev => ({ ...prev, [product_id]: true }));

            try {
                await dispatch(updateCartItem({
                    product_id,
                    quantity
                })).unwrap();
            } catch (error) {
                Alert.alert(
                    'Update Failed',
                    error || 'Failed to update cart item',
                    [{ text: 'OK' }]
                );
            } finally {
                // Clear updating state for this item
                setIsUpdating(prev => {
                    const newState = { ...prev };
                    delete newState[product_id];
                    return newState;
                });
            }
        } else {
            // Show confirmation dialog before removing
            showRemoveConfirmation(product_id);
        }
    };

    // Handle quantity input change - chỉ update local state
    const handleQuantityChange = (product_id, text) => {
        // Chỉ cho phép nhập số và không để trống
        const numericText = text.replace(/[^0-9]/g, '');

        setEditingQuantity(prev => ({
            ...prev,
            [product_id]: numericText
        }));
    };

    // Handle quantity input submit - gọi API khi user hoàn thành nhập
    const handleQuantitySubmit = async (product_id) => {
        const newQuantityText = editingQuantity[product_id];

        // Nếu không có giá trị trong editing state, không làm gì
        if (newQuantityText === undefined) {
            return;
        }

        // Nếu input trống, reset về quantity hiện tại
        if (!newQuantityText || newQuantityText.trim() === '') {
            setEditingQuantity(prev => {
                const newState = { ...prev };
                delete newState[product_id];
                return newState;
            });
            return;
        }

        const newQuantity = parseInt(newQuantityText);
        const currentItem = cartItems.find(item => item.id === product_id);

        // Nếu quantity không thay đổi, chỉ clear editing state
        if (currentItem && newQuantity === currentItem.quantity) {
            setEditingQuantity(prev => {
                const newState = { ...prev };
                delete newState[product_id];
                return newState;
            });
            return;
        }

        if (newQuantity > 0) {
            // Set updating state
            setIsUpdating(prev => ({ ...prev, [product_id]: true }));

            try {
                await dispatch(updateCartItem({
                    product_id,
                    quantity: newQuantity
                })).unwrap();

                console.log('Cart updated successfully from input');

                // Clear editing state sau khi update thành công
                setEditingQuantity(prev => {
                    const newState = { ...prev };
                    delete newState[product_id];
                    return newState;
                });
            } catch (error) {
                console.error('Update failed:', error);
                Alert.alert(
                    'Update Failed',
                    error || 'Failed to update cart item',
                    [{ text: 'OK' }]
                );

                // Reset về giá trị cũ khi có lỗi
                setEditingQuantity(prev => {
                    const newState = { ...prev };
                    delete newState[product_id];
                    return newState;
                });
            } finally {
                // Clear updating state
                setIsUpdating(prev => {
                    const newState = { ...prev };
                    delete newState[product_id];
                    return newState;
                });
            }
        } else {
            // Nếu nhập 0 hoặc số âm, hỏi có muốn xóa không
            Alert.alert(
                'Remove Item',
                'Quantity cannot be 0. Do you want to remove this item from cart?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                            // Reset về giá trị cũ
                            setEditingQuantity(prev => {
                                const newState = { ...prev };
                                delete newState[product_id];
                                return newState;
                            });
                        }
                    },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                            setEditingQuantity(prev => {
                                const newState = { ...prev };
                                delete newState[product_id];
                                return newState;
                            });
                            removeItem(product_id);
                        }
                    }
                ]
            );
        }
    };

    // Handle when input loses focus without submitting
    const handleQuantityBlur = (product_id) => {
        // Delay một chút để tránh conflict với onSubmitEditing
        setTimeout(() => {
            handleQuantitySubmit(product_id);
        }, 100);
    };

    // Show confirmation dialog for removing items
    const showRemoveConfirmation = (product_id) => {
        const item = cartItems.find(item => item.id === product_id);
        Alert.alert(
            'Remove Item',
            `Are you sure you want to remove "${item?.name}" from your cart?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeItem(product_id)
                }
            ]
        );
    };

    // Updated removeItem function to use the proper removeCartItem Redux action
    const removeItem = async (product_id) => {
        setIsUpdating(prev => ({ ...prev, [product_id]: true }));

        try {
            await dispatch(removeCartItem(product_id)).unwrap();
            console.log('Item removed successfully');

            // Show success message
            Alert.alert(
                'Success',
                'Item removed from cart successfully',
                [{ text: 'OK' }],
                { cancelable: true }
            );
        } catch (error) {
            console.error('Remove failed:', error);
            Alert.alert(
                'Remove Failed',
                error || 'Failed to remove item from cart',
                [{ text: 'OK' }]
            );
        } finally {
            setIsUpdating(prev => {
                const newState = { ...prev };
                delete newState[product_id];
                return newState;
            });
        }
    };

    // Bulk remove function - remove multiple items at once
    const removeMultipleItems = async (productIds) => {
        if (!productIds || productIds.length === 0) return;

        Alert.alert(
            'Remove Items',
            `Are you sure you want to remove ${productIds.length} item(s) from your cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove All',
                    style: 'destructive',
                    onPress: async () => {
                        // Set updating state for all items
                        const updatingState = {};
                        productIds.forEach(id => {
                            updatingState[id] = true;
                        });
                        setIsUpdating(prev => ({ ...prev, ...updatingState }));

                        try {
                            // Remove items one by one
                            for (const productId of productIds) {
                                await dispatch(removeCartItem(productId)).unwrap();
                            }

                            Alert.alert(
                                'Success',
                                'Items removed from cart successfully',
                                [{ text: 'OK' }]
                            );
                        } catch (error) {
                            Alert.alert(
                                'Remove Failed',
                                error || 'Failed to remove some items from cart',
                                [{ text: 'OK' }]
                            );
                        } finally {
                            // Clear updating state for all items
                            setIsUpdating(prev => {
                                const newState = { ...prev };
                                productIds.forEach(id => {
                                    delete newState[id];
                                });
                                return newState;
                            });
                        }
                    }
                }
            ]
        );
    };

    // Clear entire cart function
    const clearCart = () => {
        if (cartItems.length === 0) return;

        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                        const allProductIds = cartItems.map(item => item.id);
                        removeMultipleItems(allProductIds);
                    }
                }
            ]
        );
    };

    // Calculate totals using actual cart data
    const subtotal = cart?.sum ? cart.sum / 1000 : 0;
    const shipping = 0;
    const tax = 24.00;
    const total = subtotal + shipping + tax;

    const CartItem = ({ item }) => {
        const itemIsUpdating = isUpdating[item.id];

        return (
            <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <TouchableOpacity
                            onPress={() => showRemoveConfirmation(item.id)}
                            disabled={itemIsUpdating}
                            style={styles.deleteButton}
                        >
                            <Icon name="delete-outline" size={20} color={itemIsUpdating ? "#d1d5db" : "#ef4444"} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemFooter}>
                        <Text style={styles.itemPrice}>${(item.price).toFixed(3)}</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={[styles.quantityButton, itemIsUpdating && styles.disabledButton]}
                                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={itemIsUpdating}
                            >
                                <Icon name="remove" size={16} color={itemIsUpdating ? "#d1d5db" : "#6b7280"} />
                            </TouchableOpacity>

                            <TextInput
                                style={[
                                    styles.quantityInput,
                                    itemIsUpdating && styles.disabledInput
                                ]}
                                value={
                                    editingQuantity[item.id] !== undefined
                                        ? editingQuantity[item.id]
                                        : item.quantity.toString()
                                }
                                onChangeText={(text) => handleQuantityChange(item.id, text)}
                                onSubmitEditing={() => handleQuantitySubmit(item.id)}
                                onBlur={() => handleQuantityBlur(item.id)}
                                keyboardType="numeric"
                                textAlign="center"
                                maxLength={3}
                                selectTextOnFocus={true}
                                editable={!itemIsUpdating}
                                returnKeyType="done"
                            />

                            <TouchableOpacity
                                style={[styles.quantityButton, itemIsUpdating && styles.disabledButton]}
                                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={itemIsUpdating}
                            >
                                <Icon name="add" size={16} color={itemIsUpdating ? "#d1d5db" : "#6b7280"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {itemIsUpdating && (
                        <Text style={styles.updatingText}>
                            {Object.keys(isUpdating).some(key => key === item.id.toString()) ? 'Removing...' : 'Updating...'}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    // Show loading state
    if (isLoading && !cart) {
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
                    <Text style={styles.headerTitle}>Shopping Cart</Text>
                    <View style={styles.headerButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text>Loading cart...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state
    if (error && !cart) {
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
                    <Text style={styles.headerTitle}>Shopping Cart</Text>
                    <View style={styles.headerButton} />
                </View>
                <View style={styles.errorContainer}>
                    <Text>Error loading cart: {error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(fetchCartByUser())}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

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
                <Text style={styles.headerTitle}>
                    Shopping Cart ({cart?.item_count || cartItems.length})
                </Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={clearCart}
                        disabled={isLoading}
                    >
                        <Icon name="clear-all" size={24} color={isLoading ? "#d1d5db" : COLORS.white} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
            >
                {/* Cart Items */}
                {cartItems.length > 0 ? (
                    <View style={styles.cartItemsContainer}>
                        {cartItems.map((item, index) => (
                            <View key={item.id}>
                                <CartItem item={item} />
                                {index < cartItems.length - 1 && <View style={styles.itemDivider} />}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyCartContainer}>
                        <Icon name="shopping-cart" size={64} color="#d1d5db" />
                        <Text style={styles.emptyCartText}>Your cart is empty</Text>
                        <Text style={styles.emptyCartSubtext}>Add some items to get started</Text>
                        <TouchableOpacity
                            style={styles.continueShoppingButton}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Order Summary */}
                {cartItems.length > 0 && (
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryTitle}>Order Summary</Text>
                            {cartItems.length > 1 && (
                                <TouchableOpacity
                                    onPress={clearCart}
                                    disabled={isLoading}
                                    style={styles.clearAllButton}
                                >
                                    <Text style={styles.clearAllText}>Clear All</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.summaryContent}>
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
                            <View style={styles.totalDivider} />
                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Checkout Button */}
            {cartItems.length > 0 && (
                <View style={[styles.checkoutContainer, { marginBottom: 64 }]}>
                    <TouchableOpacity
                        style={[styles.checkoutButton, isLoading && styles.disabledButton]}
                        onPress={() => navigation.navigate('Payment')}
                        disabled={isLoading}
                    >
                        <Text style={styles.checkoutButtonText}>
                            {isLoading ? 'Updating...' : 'Proceed to Checkout'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <BottomNavigation />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#0d364c',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.6,
    },
    disabledInput: {
        opacity: 0.6,
        backgroundColor: '#f3f4f6',
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyCartText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
        marginTop: 16,
    },
    emptyCartSubtext: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    continueShoppingButton: {
        backgroundColor: '#0d364c',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    continueShoppingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    cartItemsContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cartItem: {
        flexDirection: 'row',
        padding: 16,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0d364c',
        flex: 1,
        marginRight: 8,
    },
    deleteButton: {
        padding: 4,
    },
    itemSpecs: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
        marginBottom: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0d364c',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 20,
    },
    quantityButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityInput: {
        width: 32,
        height: 28,
        textAlign: 'center',
        fontSize: 14,
        color: '#0d364c',
        fontWeight: '500',
        borderWidth: 0,
        padding: 0,
        margin: 0,
        backgroundColor: 'transparent',
    },
    updatingText: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: 4,
        textAlign: 'right',
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginHorizontal: 16,
    },
    summaryContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#0d364c',
    },
    clearAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    clearAllText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '500',
    },
    summaryContent: {
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: '#6b7280',
        fontSize: 14,
    },
    summaryValue: {
        color: '#0d364c',
        fontSize: 14,
    },
    totalDivider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 8,
    },
    totalRow: {
        marginBottom: 0,
    },
    totalLabel: {
        fontWeight: '500',
        color: '#0d364c',
        fontSize: 16,
    },
    totalValue: {
        fontWeight: '500',
        color: '#0d364c',
        fontSize: 18,
    },
    checkoutContainer: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: 16,
    },
    checkoutButton: {
        backgroundColor: '#0d364c',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 16,
    },
});

export default CartScreen;