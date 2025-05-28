import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

const featuredProducts = [
    {
        id: 1,
        name: 'Wireless Bluetooth Earbuds',
        image: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Earbuds',
    },
    {
        id: 2,
        name: 'Smart Fitness Watch',
        image: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Watch',
    },
    {
        id: 3,
        name: 'Portable Bluetooth Speaker',
        image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Speaker',
    },
    {
        id: 4,
        name: 'Ultra-Thin Laptop',
        image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Laptop',
    },
];

const FeaturedProducts = () => {
    const renderProduct = (product) => {
        return (
            <View key={product.id} style={styles.productWrapper}>
                <ProductCard product={product} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Featured Products</Text>
                <TouchableOpacity onPress={() => console.log('See All pressed')}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {featuredProducts.map((product) => renderProduct(product))}
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
