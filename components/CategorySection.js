import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';

const categories = [
    { id: 1, name: 'Electronics', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
    { id: 2, name: 'Fashion', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
    { id: 3, name: 'Home', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
    { id: 4, name: 'Beauty', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
    { id: 5, name: 'Sports', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
    { id: 6, name: 'Books', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
    { id: 7, name: 'Toys', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
    { id: 8, name: 'Grocery', image: 'https://res.cloudinary.com/dkbsae4kc/image/upload/v1747635969/categories/liw19bvcptp0kersyr9u.png' },
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
