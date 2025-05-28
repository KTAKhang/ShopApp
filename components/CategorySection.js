import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';

const categories = [
    { id: 1, name: 'Electronics', image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=E' },
    { id: 2, name: 'Fashion', image: 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=F' },
    { id: 3, name: 'Home', image: 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=H' },
    { id: 4, name: 'Beauty', image: 'https://via.placeholder.com/64x64/F43F5E/FFFFFF?text=B' },
    { id: 5, name: 'Sports', image: 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=S' },
    { id: 6, name: 'Books', image: 'https://via.placeholder.com/64x64/F97316/FFFFFF?text=BK' },
    { id: 7, name: 'Toys', image: 'https://via.placeholder.com/64x64/06B6D4/FFFFFF?text=T' },
    { id: 8, name: 'Grocery', image: 'https://via.placeholder.com/64x64/84CC16/FFFFFF?text=G' },
];

const CategorySection = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                    <TouchableOpacity key={category.id} style={styles.categoryItem}>
                        <View style={styles.categoryImageContainer}>
                            <Image source={{ uri: category.image }} style={styles.categoryImage} />
                        </View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    viewAll: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4F46E5',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '22%',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F9FAFB',
        marginBottom: 4,
        overflow: 'hidden',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryName: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
    },
});

export default CategorySection;
