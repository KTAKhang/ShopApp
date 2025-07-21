// Import các thư viện React Native và Redux cần thiết
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
// Import các Redux actions và selectors
import { addToCart } from '../store/slices/cartSlice';
import { selectProductReviews } from '../store/slices/reviewSlice';
import { formatCurrency } from '../utils/formatCurrency';
import Toast from 'react-native-toast-message';

/**
 * Utility function để cắt ngắn text nếu quá dài
 * @param {string} text - Text cần cắt ngắn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Text đã được cắt ngắn
 */
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Utility function để render các ngôi sao đánh giá
 * @param {number} rating - Điểm đánh giá (0-5)
 * @returns {Array} Mảng các component Icon ngôi sao
 */
const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating); // Số sao đầy
    const hasHalfStar = rating % 1 !== 0; // Có sao nửa không

    // Render sao đầy
    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <Icon key={i} name="star" size={16} color="#FFD700" />
        );
    }

    // Render sao nửa nếu có
    if (hasHalfStar) {
        stars.push(
            <Icon key="half" name="star-half" size={16} color="#FFD700" />
        );
    }

    // Render sao rỗng cho phần còn lại
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <Icon key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
        );
    }

    return stars;
};

/**
 * Component ProductCard - Card hiển thị thông tin sản phẩm
 * Chức năng chính:
 * - Hiển thị thông tin sản phẩm (hình ảnh, tên, giá, rating, stock)
 * - Xử lý thêm vào giỏ hàng với authentication check
 * - Navigate đến ProductDetail khi click vào card
 * - Hiển thị trạng thái hết hàng với overlay
 * - Loading và success modals cho add to cart action
 */
const ProductCard = ({ product }) => {
    // Hooks để navigation và dispatch Redux actions
    const navigation = useNavigation();
    const dispatch = useDispatch();
    
    // Local states để quản lý modals
    const [showLoadingModal, setShowLoadingModal] = useState(false); // Modal loading khi thêm vào giỏ hàng
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal thành công
    
    // Lấy trạng thái authentication từ Redux store
    const { isAuthenticated } = useSelector((state) => state.auth);

    /**
     * Safety check: Không render sản phẩm bị ẩn (inactive)
     * Trả về null nếu product không tồn tại hoặc status = false
     */
    if (!product || product.status === false) {
        return null;
    }

    /**
     * Lấy reviews cho sản phẩm cụ thể này từ Redux store
     * Sử dụng selector để lấy reviews theo product ID
     */
    const productReviews = useSelector(state => selectProductReviews(state, product._id));

    /**
     * Tính toán rating trung bình cho sản phẩm này
     * Nếu không có reviews thì rating = 0
     */
    const averageRating = productReviews && productReviews.length > 0
        ? productReviews.reduce((acc, review) => acc + review.rating, 0) / productReviews.length
        : 0;

    /**
     * Kiểm tra sản phẩm có hết hàng không
     * Hết hàng khi quantity <= 0
     */
    const isOutOfStock = product.quantity <= 0;

    /**
     * Xử lý click vào card sản phẩm
     * Navigate đến màn hình ProductDetail với productId
     */
    const handlePress = () => {
        navigation.navigate('ProductDetail', { productId: product._id });
    };

    /**
     * Xử lý thêm sản phẩm vào giỏ hàng
     * Bao gồm authentication check, loading states, và error handling
     */
    const handleAddToCart = async () => {
        if (showLoadingModal || isOutOfStock) return; // Ngăn click nhiều lần hoặc khi hết hàng

        // Kiểm tra user đã đăng nhập chưa
        if (!isAuthenticated) {
            Alert.alert(
                'Yêu cầu đăng nhập',
                'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn đăng nhập ngay không?',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        // Hiển thị loading modal
        setShowLoadingModal(true);
        try {
            // Gọi Redux action để thêm vào giỏ hàng với quantity = 1
            await dispatch(addToCart({
                product_id: product._id,
                quantity: 1
            })).unwrap();

            // Ẩn loading và hiển thị success modal
            setShowLoadingModal(false);
            setShowSuccessModal(true);
            
            // Tự động ẩn success modal sau 2 giây
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);
        } catch (error) {
            // Xử lý lỗi: ẩn loading và hiển thị toast error
            setShowLoadingModal(false);
            Toast.show({
                type: 'error',
                text1: 'Không thể thêm vào giỏ hàng',
                text2: error?.toString() || 'Có lỗi xảy ra khi thêm sản phẩm',
                position: 'top',
                visibilityTime: 2500,
            });
        }
    };

    // Render main UI
    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            {/* Card container với LinearGradient background */}
            <LinearGradient
                colors={[COLORS.white, COLORS.background]}
                style={styles.card}
            >
                {/* Container hình ảnh sản phẩm */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                    {/* Overlay hiển thị khi hết hàng */}
                    {isOutOfStock && (
                        <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>Hết hàng</Text>
                        </View>
                    )}
                </View>
                
                {/* Container thông tin sản phẩm */}
                <View style={styles.infoContainer}>
                    {/* Tên sản phẩm (tối đa 2 dòng) */}
                    <Text style={styles.name} numberOfLines={2}>{truncateText(product.name, 20)}</Text>
                    
                    {/* Container hiển thị rating */}
                    <View style={styles.ratingContainer}>
                        {renderStars(averageRating)}
                        <Text style={styles.ratingText}>({averageRating.toFixed(1)})</Text>
                    </View>
                    
                    {/* Container giá và nút thêm vào giỏ hàng */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                isOutOfStock && styles.addButtonDisabled // Style khác khi hết hàng
                            ]}
                            onPress={handleAddToCart}
                            disabled={showLoadingModal || isOutOfStock} // Disable khi loading hoặc hết hàng
                        >
                            <Icon
                                name={isOutOfStock ? "remove-shopping-cart" : "add-shopping-cart"}
                                size={16}
                                color={isOutOfStock ? "#999" : COLORS.white}
                            />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Indicator hiển thị số lượng còn lại */}
                    <View style={styles.stockContainer}>
                        <Text style={[
                            styles.stockText,
                            isOutOfStock && styles.stockTextOutOfStock // Style khác khi hết hàng
                        ]}>
                            {isOutOfStock ? 'Hết hàng' : `Còn ${product.quantity} sản phẩm`}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Modal Loading khi đang thêm vào giỏ hàng */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showLoadingModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.modalText}>Đang thêm vào giỏ hàng...</Text>
                    </View>
                </View>
            </Modal>

            {/* Modal Success khi thêm vào giỏ hàng thành công */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showSuccessModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Icon name="check-circle" size={50} color="#4CAF50" />
                        <Text style={styles.modalText}>Thêm vào giỏ hàng thành công!</Text>
                    </View>
                </View>
            </Modal>
        </TouchableOpacity>
    );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
    // Container chính của card
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
    // Card với gradient background
    card: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    // Container hình ảnh sản phẩm
    imageContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    // Hình ảnh sản phẩm
    image: {
        width: '100%',
        height: '100%',
    },
    // Overlay hiển thị khi hết hàng
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Text "Hết hàng"
    outOfStockText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        backgroundColor: '#ff4757',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    // Container thông tin sản phẩm
    infoContainer: {
        padding: 12,
    },
    // Tên sản phẩm
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 6,
        height: 40, // Fixed height để layout consistent
    },
    // Container rating
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    // Text hiển thị rating số
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    // Container giá và nút add
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    // Text giá sản phẩm
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    // Nút thêm vào giỏ hàng
    addButton: {
        backgroundColor: COLORS.primary,
        padding: 6,
        borderRadius: 12,
        elevation: 2,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    // Style nút khi disabled (hết hàng)
    addButtonDisabled: {
        backgroundColor: '#e0e0e0',
        shadowOpacity: 0,
    },
    // Container thông tin stock
    stockContainer: {
        marginTop: 4,
    },
    // Text hiển thị số lượng còn lại
    stockText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '500',
    },
    // Style text khi hết hàng
    stockTextOutOfStock: {
        color: '#ff4757',
    },
    // Overlay cho modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Content của modal
    modalContent: {
        backgroundColor: COLORS.white,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 250,
        elevation: 5,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    // Text trong modal
    modalText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginTop: 15,
        textAlign: 'center',
    },
});

export default ProductCard;