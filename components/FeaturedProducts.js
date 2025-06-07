import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

const FeaturedProducts = ({ products }) => {
    if (!products || products.length === 0) {
        return <Text style={styles.errorText}>No products available.</Text>;
    }

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
                {products.map((product) => (
                    <View key={product._id} style={styles.productWrapper}>
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
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default FeaturedProducts;
