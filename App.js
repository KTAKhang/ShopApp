import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';

// 🟩 Thêm import
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { View } from 'react-native';

export default function App() {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <View style={{ flex: 1 }}> {/* Single container wrapping multiple children */}
          <AppNavigator />
          <Toast />
        </View>
      </ActionSheetProvider>
    </Provider>
  );
}