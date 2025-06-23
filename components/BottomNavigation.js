import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const BottomNavigation = () => {
    const [activeTab, setActiveTab] = useState('Home');
    const navigation = useNavigation();
    const tabs = [
        { name: 'HomePage', icon: 'home', label: 'Trang chủ' },
        { name: 'Cart', icon: 'shopping-cart', label: 'Giỏ hàng' },
        { name: 'OrderHistory', icon: 'local-shipping', label: 'Đơn hàng' },
        { name: 'Profile', icon: 'person', label: 'Hồ sơ' },
    ];

    const handleTabPress = (tabName) => {
        setActiveTab(tabName);
        navigation.navigate(tabName)

    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigation}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.name}
                        style={styles.tabItem}
                        onPress={() => handleTabPress(tab.name)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Icon
                                name={tab.icon}
                                size={24}
                                color={activeTab === tab.name ? '#007AFF' : '#9CA3AF'}
                            />
                        </View>
                        <Text
                            style={[
                                styles.tabLabel,
                                {
                                    color: activeTab === tab.name ? '#007AFF' : '#9CA3AF',
                                },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    navigation: {
        flexDirection: 'row',
        height: 64,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '400',
    },
});

export default BottomNavigation;