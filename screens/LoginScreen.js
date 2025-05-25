import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { isLoading, error } = useSelector((state) => state.auth);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const dispatch = useDispatch();
    const passwordRef = useRef(null);

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

    useEffect(() => {
        if (error) {
            Alert.alert('Login Error', error);
            useDispatch(clearError());
        }
    }, [error, dispatch]);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        dispatch(loginUser({ email: email.trim(), password }));
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

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.keyboardContainer}>
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.title}>Đăng Nhập</Text>

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <Mail color="#13C2C2" size={20} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#aaa"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                            />

                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <Lock color="#13C2C2" size={20} />
                            <TextInput
                                ref={passwordRef}
                                style={styles.input}
                                placeholder="Mật khẩu"
                                placeholderTextColor="#aaa"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />

                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff color="#13C2C2" size={20} />
                                ) : (
                                    <Eye color="#13C2C2" size={20} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.disabledButton]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}> Đăng ký</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

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
    keyboardContainer: {
        flexGrow: 1,
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
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#13C2C2',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    loginButton: {
        backgroundColor: '#13C2C2',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: '#333',
        fontSize: 14,
    },
    footerLink: {
        color: '#13C2C2',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    }

});

export default LoginScreen;
