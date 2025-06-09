import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const TopNavBar = () => {
    const navigation = useNavigation();
    const { cart } = useSelector((state) => state.cart);
    const itemCount = cart?.item_count || 0;

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <Text style={styles.logo}>ShopApp</Text>
                <TouchableOpacity 
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Icon name="shopping-cart" size={24} color={COLORS.white} />
                    {itemCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{itemCount}</Text>
                        </View>
                    )}
                    </TouchableOpacity>
            </LinearGradient>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: (StatusBar.currentHeight || 0) + 12,
        elevation: 5,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    logo: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.white,
        letterSpacing: 1,
    },
    cartButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
});

export default TopNavBar;