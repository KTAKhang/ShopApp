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
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchProductByIdAsync } from '../store/slices/productSlice';
import { fetchProductReviewsByProductId } from '../store/slices/reviewSlice';
import { addToCart } from '../store/slices/cartSlice';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    // Get product ID from route params
    const productId = route?.params?.productId;

    // Get product and loading state from Redux
    const { product, isLoading: productLoading, error } = useSelector((state) => state.product);
    const { reviews, isLoading: reviewsLoading } = useSelector((state) => state.review);

    // Debug logs
    console.log('ProductDetailScreen - productId:', productId);
    console.log('ProductDetailScreen - product:', product);
    console.log('ProductDetailScreen - productLoading:', productLoading);
    console.log('ProductDetailScreen - error:', error);
    console.log('ProductDetailScreen - reviews:', reviews);

    useEffect(() => {
        console.log('useEffect - productId:', productId);
        console.log('useEffect - route params:', route?.params);
        
        if (productId && productId !== 'undefined') {
            console.log('Dispatching fetchProductByIdAsync with productId:', productId);
            dispatch(fetchProductByIdAsync(productId));
            dispatch(fetchProductReviewsByProductId(productId));
        } else {
            console.log('No valid productId found in route params');
            console.log('Available params:', JSON.stringify(route?.params));
        }
    }, [dispatch, productId]);

    const isLoading = productLoading || reviewsLoading;

    // Debug error state
    if (error) {
        console.log('Error occurred:', error);
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => dispatch(fetchProductByIdAsync(productId))}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Loading product...</Text>
            </View>
        );
    }

    if (!productId || productId === 'undefined') {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Invalid Product ID</Text>
                <Text style={styles.debugText}>
                    Please navigate to this screen with a valid product ID
                </Text>
                <Text style={styles.debugText}>
                    Route params: {JSON.stringify(route?.params)}
                </Text>
                <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!product) {
        console.log('Product is null or undefined');
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
                <Text style={styles.debugText}>Product ID: {productId}</Text>
                <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => dispatch(fetchProductByIdAsync(productId))}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
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

    const handleAddToCart = async () => {
        try {
            await dispatch(addToCart({
                product_id: productId,
                quantity: quantity
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

    const handleBuyNow = () => {
        navigation.navigate('BuyNow', {
            product: product,
            quantity: quantity
        });
    };

    const handleShare = () => {
        console.log('Share product');
    };

    // Calculate average rating from reviews
    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Product Details</Text>

                <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                    <Icon name="share" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: product.image }} 
                        style={styles.productImage}
                        onError={(error) => console.log('Image load error:', error)}
                    />
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
                        <Text style={styles.reviewCount}>• {reviews ? reviews.length : 0} Reviews</Text>
                    </View>

                    {/* Price and Quantity */}
                    <View style={styles.priceQuantityContainer}>
                        <Text style={styles.price}>${product.price.toFixed(3)}</Text>
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
                        <Text style={styles.description}>{product.detail_desc}</Text>
                    </View>

                    {/* Type and Rating */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <View style={styles.featureItem}>
                            <Icon name="category" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Type: {product.target}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Icon name="star" size={16} color="#4caf50" />
                            <Text style={styles.featureText}>Rating: {averageRating.toFixed(1)}/5</Text>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Reviews ({reviews ? reviews.length : 0})</Text>
                        {reviews && reviews.map((review, index) => (
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
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity 
                    style={styles.addToCartButton} 
                    onPress={handleAddToCart}
                    disabled={isLoading}
                >
                    <Icon name="shopping-cart" size={20} color={COLORS.primary} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.buyNowButton} 
                    onPress={handleBuyNow}
                    disabled={isLoading}
                >
                    <Icon name="shopping-bag" size={20} color={COLORS.white} />
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#ff4757',
        marginBottom: 10,
        textAlign: 'center',
    },
    debugText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.light,
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 8,
        marginRight: 8,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 8,
    },
    buyNowButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        marginLeft: 8,
    },
    buyNowText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
        marginLeft: 8,
    },
});

export default ProductDetailScreen;