import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { confirmOtp } from '../store/slices/authSlice';
import Toast from 'react-native-toast-message';

const { height } = Dimensions.get('window');

const RegisterConfirmOTPScreen = ({ navigation }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 ký tự OTP
    const inputRefs = useRef([]);
    const dispatch = useDispatch();
    const { confirmOtpStatus, confirmOtpMessage, isLoading } = useSelector((state) => state.auth);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleOtpChange = (text, index) => {
        // Chỉ cho phép nhập số
        if (!/^\d*$/.test(text)) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Tự động chuyển sang ô tiếp theo khi nhập
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Xử lý phím Backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleConfirm = async () => {
        const otpString = otp.join('');

        if (!otpString.trim() || otpString.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập đầy đủ mã OTP (6 số)',
            });
            return;
        }

        const resultAction = await dispatch(confirmOtp(otpString));

        if (confirmOtp.fulfilled.match(resultAction)) {
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: confirmOtpMessage || 'Xác thực thành công',
            });

            setTimeout(() => {
                navigation.navigate('Login');
            }, 2000);
        } else {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: resultAction.payload || 'Xác thực OTP thất bại',
            });
        }
    };

    const clearOtp = () => {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    return (
        <LinearGradient
            colors={['#0D364C', '#13C2C2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.backgroundElements}>
                <View style={[styles.circle, styles.circle1]} />
                <View style={[styles.circle, styles.circle2]} />
                <View style={[styles.circle, styles.circle3]} />
                <View style={[styles.circle, styles.circle4]} />
            </View>

            {/* Header với nút quay lại */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.title}>Xác thực OTP</Text>
                    <Text style={styles.subtitle}>
                        Vui lòng nhập mã OTP đã được gửi đến email của bạn
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null
                                ]}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity style={styles.clearButton} onPress={clearOtp}>
                        <Text style={styles.clearButtonText}>Xóa và nhập lại</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.disabledButton]}
                        onPress={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Xác nhận</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <Toast />
        </LinearGradient>
    );
};

export default RegisterConfirmOTPScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundElements: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        backgroundColor: '#ffffff20',
        borderRadius: 100,
    },
    circle1: {
        width: 200,
        height: 200,
        top: -50,
        left: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: -30,
        right: -30,
    },
    circle3: {
        width: 100,
        height: 100,
        top: height / 3,
        left: -40,
    },
    circle4: {
        width: 120,
        height: 120,
        bottom: height / 4,
        right: -40,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    card: {
        backgroundColor: '#ffffffcc',
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0D364C',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    otpInput: {
        width: 45,
        height: 50,
        borderWidth: 2,
        borderColor: '#13C2C2',
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        backgroundColor: '#fff',
    },
    otpInputFilled: {
        borderColor: '#0D364C',
        backgroundColor: '#fff',
    },
    clearButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    clearButtonText: {
        color: '#13C2C2',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    submitButton: {
        backgroundColor: '#13C2C2',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
});