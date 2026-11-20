import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StyleSheet, View, Text } from 'react-native';
import ConversationScreen from './ConversationScreen';
import ChatScreen from './ChatScreen';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
    return (
        <Stack.Navigator initialRouteName='Conversation' screenOptions={{
            headerBackButtonDisplayMode: 'generic',
            headerStyle: { backgroundColor: '#F5F7FA' },
            headerTintColor: '#17212B',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#F5F7FA' },
        }}>
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name='Chat' component={ChatScreen} options={({ route }) => {
                return {
                    headerTitle: route.params.data.name ?? 'Unknow Name'
                }
            }} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({})

export default StackNavigation;
