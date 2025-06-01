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
import { fetchUserProfile, resetUpdateSuccess, updateUserProfile } from '../store/slices/userSlice';
import { fetchOrderByUser } from '../store/slices/orderSlice';
import EditProfileModal from '../components/EditProfileModal';


const ProfileScreen = ({ navigation }) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [newsletter, setNewsletter] = useState(true);
    const dispatch = useDispatch();
    const { profile, isLoading, isUpdateSuccess, error } = useSelector((state) => state.user);
    const { orders, isLoading: orderLoading, error: orderError } = useSelector((state) => state.order);
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
    }, [isUpdateSuccess]);





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
        setEditModalVisible(false);
    };




    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : profile && profile.user_name && Array.isArray(orders) && orders.length > 0 ? (
                    <>
                        <ProfileHeader
                            profile={profile}
                            onEditPress={() => setEditModalVisible(true)}
                        />
                        <PersonalInfoSection
                            profile={profile}
                            onChangePasswordPress={() => setPasswordModalVisible(true)}
                        />
                        <OrderHistorySection
                            orderHistory={orders}
                            onViewAll={() => navigation?.navigate('OrderHistory')}
                            onOrderPress={(order) => console.log(order)}
                        />
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>
                        Không thể tải thông tin người dùng.
                    </Text>
                )}

            </ScrollView>
            <BottomNavigation />
            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                profile={profile}
                onSave={handleUpdateProfile}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        marginTop: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
        marginTop: 24,
        marginBottom: 50,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default ProfileScreen;