import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ProductCard = ({ product }) => {
    if (!product) return null;

    return (
        <View style={styles.card}>
            <Image source={{ uri: product.image }} style={styles.image} />
            <Text style={styles.name} numberOfLines={2}>
                {product.name}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
});

export default ProductCard;
