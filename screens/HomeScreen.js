import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import TopNavBar from '../components/TopNavBar';
import SearchBar from '../components/SearchBar';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import BottomNavigation from '../components/BottomNavigation';


const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <TopNavBar />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <SearchBar />
                <CategorySection />
                <FeaturedProducts />
                <FeaturedProducts />

                <BottomNavigation />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
});

export default HomeScreen;