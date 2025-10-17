import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '@state/AppState';
import AppNavigator from '@navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import { useNavigationAppTheme, usePaperTheme } from '@ui/theme';

export default function App() {
  const paperTheme = usePaperTheme();
  const navigationTheme = useNavigationAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <AppStateProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style={paperTheme.dark ? 'light' : 'dark'} />
              <AppNavigator />
            </NavigationContainer>
          </AppStateProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
