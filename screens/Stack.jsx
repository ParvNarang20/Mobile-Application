import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversationScreen from './ConversationScreen';
import ChatScreen from './ChatScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigation() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#F5F7FA' },
                headerTintColor: '#17212B',
                headerTitleStyle: { fontWeight: 'bold' },
                contentStyle: { backgroundColor: '#F5F7FA' },
            }}
        >
            <Stack.Screen name="Conversation" component={ConversationScreen} options={{ title: 'Messages' }} />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({ title: route.params.data.name || 'Chat' })}
            />
        </Stack.Navigator>
    );
}
