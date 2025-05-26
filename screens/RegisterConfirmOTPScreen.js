import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { confirmOtp } from '../store/slices/authSlice';
import Toast from 'react-native-toast-message';

const RegisterConfirmOTPScreen = ({ navigation }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 ký tự OTP
    const inputRefs = useRef([]);
    const dispatch = useDispatch();
    const { confirmOtpStatus, confirmOtpMessage, isLoading } = useSelector((state) => state.auth);

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
        <View style={styles.container}>
            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={styles.subtitle}>Vui lòng nhập mã OTP gồm 6 số</Text>

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
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleConfirm}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
                </Text>
            </TouchableOpacity>

            <Toast />
        </View>
    );
};

export default RegisterConfirmOTPScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
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
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    otpInputFilled: {
        borderColor: '#007bff',
        backgroundColor: '#fff',
    },
    clearButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    clearButtonText: {
        color: '#007bff',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});