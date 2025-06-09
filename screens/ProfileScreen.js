import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    Switch,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomNavigation from '../components/BottomNavigation';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import ProfileHeader from '../components/ProfileHeader';
import PersonalInfoSection from '../components/PersonalInfoSection';
import OrderHistorySection from '../components/OrderHistorySection';
import { changePassword, fetchUserProfile, resetChangePasswordSuccess, resetUpdateSuccess, updateUserProfile } from '../store/slices/userSlice';
import { fetchOrderByUser } from '../store/slices/orderSlice';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const ProfileScreen = ({ navigation }) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [newsletter, setNewsletter] = useState(true);
    const dispatch = useDispatch();
    const { profile, isLoading, isUpdateSuccess, isChangePasswordSuccess, error } = useSelector((state) => state.user);
    const { orders, isLoading: orderLoading, error: orderError } = useSelector((state) => state.order);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(fetchOrderByUser());
    }, [dispatch]);

    useEffect(() => {
        if (isUpdateSuccess) {
            dispatch(fetchUserProfile());
            Alert.alert(
                'Cập nhật thành công',
                'Thông tin cá nhân của bạn đã được cập nhật.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setEditModalVisible(false);
                            dispatch(resetUpdateSuccess());
                        },
                    },
                ]
            );
        }
    }, [isUpdateSuccess, dispatch]);

    useEffect(() => {
        if (isChangePasswordSuccess) {
            Alert.alert(
                'Đổi mật khẩu thành công',
                'Mật khẩu của bạn đã được cập nhật.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setPasswordModalVisible(false);
                            // Reset form
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            dispatch(resetChangePasswordSuccess());
                        },
                    },
                ]
            );
        }
    }, [isChangePasswordSuccess, dispatch]);

    // Handle error for change password
    useEffect(() => {
        if (error && passwordModalVisible) {
            Alert.alert(
                'Lỗi đổi mật khẩu',
                error,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Keep modal open so user can retry
                        },
                    },
                ]
            );
        }
    }, [error, passwordModalVisible]);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => dispatch(logoutUser())
                },
            ]
        );
    };

    const handleUpdateProfile = (updatedProfile) => {
        dispatch(updateUserProfile(updatedProfile));
        console.log("Dữ liệu mới:", updatedProfile);
    };
    
    const handleChangePassword = () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu hiện tại.');
            return;
        }

        // API yêu cầu old_password và new_password
        const passwordData = {
            old_password: currentPassword,
            new_password: newPassword,
        };

        console.log('Change password data:', passwordData);
        dispatch(changePassword(passwordData));
    };

    const handleClosePasswordModal = () => {
        setPasswordModalVisible(false);
        // Reset form when closing
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const menuItems = [
        {
            icon: 'person-outline',
            title: 'Personal Information',
            onPress: () => setEditModalVisible(true), // Mở modal thay vì navigate
        },
        {
            icon: 'lock-outline',
            title: 'Change Password',
            onPress: () => setPasswordModalVisible(true), // Thêm chức năng đổi mật khẩu
        },
        {
            icon: 'local-shipping',
            title: 'My Orders',
            onPress: () => navigation.navigate('OrderHistory'),
        },
        {
            icon: 'favorite-border',
            title: 'Wishlist',
            onPress: () => navigation.navigate('Wishlist'),
        },
        {
            icon: 'location-on',
            title: 'Shipping Address',
            onPress: () => navigation.navigate('ShippingAddress'),
        },
        {
            icon: 'payment',
            title: 'Payment Methods',
            onPress: () => navigation.navigate('PaymentMethods'),
        },
        {
            icon: 'settings',
            title: 'Settings',
            onPress: () => navigation.navigate('Settings'),
        },
        {
            icon: 'help-outline',
            title: 'Help & Support',
            onPress: () => navigation.navigate('Support'),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
            
            <LinearGradient
                colors={COLORS.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                        <Image
                            source={{ uri: profile?.avatar || 'https://via.placeholder.com/100' }}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile?.user_name || 'Guest User'}</Text>
                        <Text style={styles.profileEmail}>{profile?.email || 'guest@example.com'}</Text>
                        <TouchableOpacity 
                            style={styles.editProfileButton}
                            onPress={() => setEditModalVisible(true)}
                        >
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
            >
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <Icon name={item.icon} size={24} color={COLORS.primary} />
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={24} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomNavigation />

            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                profile={profile}
                onSave={handleUpdateProfile}
            />

            <ChangePasswordModal
                visible={passwordModalVisible}
                onClose={handleClosePasswordModal}
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                setCurrentPassword={setCurrentPassword}
                setNewPassword={setNewPassword}
                setConfirmPassword={setConfirmPassword}
                onSubmit={handleChangePassword}
                isLoading={isLoading}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerGradient: {
        paddingTop: StatusBar.currentHeight + 10,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.white,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.8,
        marginBottom: 8,
    },
    editProfileButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.white,
        alignSelf: 'flex-start',
    },
    editProfileText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        marginTop: -20,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 30,
    },
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 8,
        elevation: 2,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        marginLeft: 16,
        color: COLORS.text.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.error,
        marginLeft: 8,
    },
});

export default ProfileScreen;