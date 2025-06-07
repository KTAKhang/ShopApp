import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchProductByIdAsync } from '../store/slices/productSlice';
import { fetchProductReviewsByProductId } from '../store/slices/reviewSlice';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    // Get product ID from route params
    const productId = route?.params?.productId;

    // Get product and loading state from Redux
    const { product, isLoading: productLoading } = useSelector((state) => state.product);
    const { reviews, isLoading: reviewsLoading } = useSelector((state) => state.review);

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductByIdAsync(productId));
            dispatch(fetchProductReviewsByProductId(productId));
        }
    }, [dispatch, productId]);

    const isLoading = productLoading || reviewsLoading;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

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

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        // Handle add to cart logic
        console.log('Added to cart:', { product: product._id, quantity });
    };

    const handleBuyNow = () => {
        // Handle buy now logic
        console.log('Buy now:', { product: product._id, quantity });
    };

    const handleShare = () => {
        // Handle share logic
        console.log('Share product');
    };

    // Calculate average rating from reviews
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Product Details</Text>

                <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                    <Icon name="share" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => setIsFavorite(!isFavorite)}
                    >
                        <Icon
                            name={isFavorite ? "favorite" : "favorite-border"}
                            size={24}
                            color={isFavorite ? "#ff4757" : "#666"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                            {renderStars(averageRating)}
                        </View>
                        <Text style={styles.ratingText}>({averageRating.toFixed(1)})</Text>
                        <Text style={styles.reviewCount}>• {reviews.length} Reviews</Text>
                    </View>

                    {/* Price and Quantity */}
                    <View style={styles.priceQuantityContainer}>
                        <View>
                            <Text style={styles.price}>${product.price}</Text>
                            <Text style={styles.taxText}>Tax included</Text>
                        </View>

                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange('decrease')}
                            >
                                <Icon name="remove" size={20} color="#666" />
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>{quantity}</Text>

                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange('increase')}
                            >
                                <Icon name="add" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>

                    {/* Type and Rating */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <View style={styles.featureItem}>
                            <Icon name="category" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Type: {product.type}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Icon name="star" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Rating: {averageRating.toFixed(1)}/5</Text>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                        {reviews.map((review, index) => (
                            <View key={review._id || index} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
                                    <View style={styles.starsContainer}>
                                        {renderStars(review.rating)}
                                    </View>
                                </View>
                                <Text style={styles.reviewText}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Info */}
                    <View style={styles.deliveryContainer}>
                        <View style={styles.deliveryIcon}>
                            <Icon name="local-shipping" size={24} color="#007bff" />
                        </View>
                        <View style={styles.deliveryInfo}>
                            <Text style={styles.deliveryTitle}>Free Delivery</Text>
                            <Text style={styles.deliverySubtitle}>2-3 business days</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Icon name="shopping-cart" size={20} color="#007bff" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
                    <Icon name="shopping-bag" size={20} color="#fff" />
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
    },
    imageContainer: {
        position: 'relative',
        height: 300,
        backgroundColor: '#f8f9fa',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productInfo: {
        padding: 16,
    },
    productName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    reviewCount: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    priceQuantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007bff',
    },
    taxText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '500',
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    reviewItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    deliveryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 80,
    },
    deliveryIcon: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deliveryInfo: {
        marginLeft: 12,
    },
    deliveryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    deliverySubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 8,
        marginRight: 8,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007bff',
        marginLeft: 8,
    },
    buyNowButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#007bff',
        borderRadius: 8,
        marginLeft: 8,
    },
    buyNowText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
});

export default ProductDetailScreen;