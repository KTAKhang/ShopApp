import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <Icon key={i} name="star" size={16} color="#FFD700" />
        );
    }

    if (hasHalfStar) {
        stars.push(
            <Icon key="half" name="star-half" size={16} color="#FFD700" />
        );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <Icon key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
        );
    }

    return stars;
};

const ProductCard = ({ product }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const handlePress = () => {
        navigation.navigate('ProductDetail', { productId: product._id });
    };

    const handleAddToCart = async () => {
        try {
            await dispatch(addToCart({
                product_id: product._id,
                quantity: 1
            })).unwrap();

            Alert.alert(
                'Success',
                'Product added to cart successfully',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Failed to add to cart:', error);
            Alert.alert(
                'Error',
                'Failed to add item to cart. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <LinearGradient
                colors={[COLORS.white, COLORS.background]}
                style={styles.card}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image }} style={styles.image} />
                    {/* <View style={styles.discount}>
                        <Text style={styles.discountText}>-20%</Text>
                    </View> */}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name} numberOfLines={2}>{truncateText(product.name, 20)}</Text>
                    <View style={styles.ratingContainer}>
                        {renderStars(product.rating || 0)}
                        <Text style={styles.ratingText}>({product.rating ? product.rating.toFixed(1) : '0.0'})</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>${product.price.toFixed(3)}</Text>
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={handleAddToCart}
                        >
                            <Icon name="add-shopping-cart" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 280,
        borderRadius: 20,
        elevation: 5,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        backgroundColor: COLORS.white,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    discount: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    infoContainer: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 6,
        height: 40,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 15,
        elevation: 2,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});

export default ProductCard;
