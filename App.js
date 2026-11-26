import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ImagePickerScreen from './screens/ImagePicker';
import AllUsers from './screens/AllUsers';
import RawCameraScreen from './screens/RawCameraScreen';
import StackNavigation from './screens/Stack';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Tab.Navigator initialRouteName="Conversations">
                    <Tab.Screen
                        name="Conversations"
                        component={StackNavigation}
                        options={{ title: 'Chats', headerShown: false }}
                    />
                    <Tab.Screen
                        name="AllUsers"
                        component={AllUsers}
                        options={{ title: 'New Chat', headerTitle: 'Start a chat' }}
                    />
                    <Tab.Screen name="Camera" component={RawCameraScreen} />
                    <Tab.Screen name="Gallery" component={ImagePickerScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
