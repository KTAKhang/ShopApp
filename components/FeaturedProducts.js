import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

const featuredProducts = [
    {
        id: 1,
        name: 'Wireless Bluetooth Earbuds',
        price: '59.99',
        rating: 4.5,
        image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747706328/avatars/mfwbvrkvqcsv6kgze587.png',
    },
    {
        id: 2,
        name: 'Smart Fitness Watch',
        price: '89.99',
        rating: 4.0,
        image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747706328/avatars/mfwbvrkvqcsv6kgze587.png',
    },
    {
        id: 3,
        name: 'Portable Bluetooth Speaker',
        price: '79.99',
        rating: 5.0,
        image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747706328/avatars/mfwbvrkvqcsv6kgze587.png',
    },
    {
        id: 4,
        name: 'Ultra-Thin Laptop',
        price: '899.99',
        rating: 4.7,
        image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747706328/avatars/mfwbvrkvqcsv6kgze587.png',
    },
];

const FeaturedProducts = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Featured Products</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {featuredProducts.map((product) => (
                    <View key={product.id} style={styles.productWrapper}>
                        <ProductCard product={product} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4F46E5',
    },
    scrollContent: {
        paddingRight: 16,
    },
    productWrapper: {
        width: 160,
        marginRight: 12,
    },
});

export default FeaturedProducts;