import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../store/slices/authSlice';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';
import AdminScreen from '../screens/AdminScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterConfirmOTPScreen from '../screens/RegisterConfirmOTPScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';


const Stack = createStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);


  useEffect(() => {
    const initializeAuth = async () => {
      await dispatch(checkAuthStatus());
      setIsInitializing(false);
    };

    initializeAuth();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          user.role_name === 'admin' ? (
            <Stack.Screen name="Admin" component={AdminScreen} />
          ) : (
            <>
              <Stack.Screen name="HomePage" component={HomeScreen} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            </>
          )

        ) : (
          <>

            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOtp" component={RegisterConfirmOTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}