import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const ProductCard = ({ product, showDiscount = false }) => {
    const navigation = useNavigation();

    const handleAddToCart = () => {
        console.log(`Adding ${product.name} to cart`);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        // Vẽ các ngôi sao đầy đủ
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Icon key={i} name="star" size={12} color="#FCD34D" />);
        }

        // Vẽ ngôi sao nửa
        if (hasHalfStar) {
            stars.push(<Icon key="half" name="star-half" size={12} color="#FCD34D" />);
        }

        // Vẽ các ngôi sao trống
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Icon key={`empty-${i}`} name="star-border" size={12} color="#FCD34D" />);
        }

        return stars;
    };

    return (
        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('ProductDetail')}>
            <View style={styles.imageContainer}>
                {showDiscount && product.discount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{product.discount}%</Text>
                    </View>
                )}
                <Image source={{ uri: product.image }} style={styles.image} />
            </View>
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                <View style={styles.ratingContainer}>
                    <View style={styles.stars}>
                        {renderStars(product.rating)}
                    </View>
                    <Text style={styles.ratingText}>{product.rating}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <View style={styles.priceSection}>
                        <Text style={styles.price}>${product.price}</Text>
                        {showDiscount && product.originalPrice && (
                            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                        <Icon name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 160,
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomRightRadius: 8,
        zIndex: 1,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    content: {
        padding: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    originalPrice: {
        fontSize: 12,
        color: '#6B7280',
        textDecorationLine: 'line-through',
        marginLeft: 4,
    },
    addButton: {
        width: 28,
        height: 28,
        backgroundColor: '#4F46E5',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProductCard;
