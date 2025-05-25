import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider} from 'react-native-paper'; // ✅ STEP 1: Import Paper Provider
import HomeScreen from './screens/HomeScreen';
import RoomScreen from './screens/RoomScreen';
import CustomerFormScreen from './screens/CustomerFormScreen';
import { CustomerProvider } from './screens/CustomerContext';
import CashOutflowForm from './screens/CashOutflowScreen';
import ReportScreen from './screens/ReportScreen';
import DeleteFlatScreen from './screens/DeleteFlatScreen';
import { LogBox } from 'react-native';

const Stack = createStackNavigator();

export default function App() {

  LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component']);
  
  return (
    <PaperProvider> {/* ✅ STEP 2: Wrap everything inside this */}
      <CustomerProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Rooms" component={RoomScreen} />
            <Stack.Screen name="CashOutflow" component={CashOutflowForm} />
            <Stack.Screen name="CustomerForm" component={CustomerFormScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="DeleteFlatScreen" component={DeleteFlatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CustomerProvider>
    </PaperProvider>
  );
}