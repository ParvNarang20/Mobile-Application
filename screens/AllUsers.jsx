import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../api';

export default function AllUsers({ navigation }) {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [chatType, setChatType] = useState('DM');
    const [chatName, setChatName] = useState('');
    const [yourName, setYourName] = useState('Me');
    const [loading, setLoading] = useState(true);

    const loadUsers = () => {
        setLoading(true);
        fetch(`${API_URL}/user`)
            .then(response => {
                if (!response.ok) throw new Error('Could not load people');
                return response.json();
            })
            .then(data => setUsers(data.filter(user => user.id !== 'user-1')))
            .catch(() => Alert.alert('Chat server is off', 'Start the server with: npm run server'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const chooseType = type => {
        setChatType(type);
        setSelectedUsers([]);
    };

    const selectUser = id => {
        if (chatType === 'DM') {
            setSelectedUsers([id]);
        } else if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(userId => userId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const startChat = () => {
        if (selectedUsers.length === 0) {
            Alert.alert('Choose someone', 'Select at least one person first.');
            return;
        }

        const name = chatType === 'GROUP' ? (chatName.trim() || 'Group chat') : users.find(user => user.id === selectedUsers[0])?.name;

        fetch(`${API_URL}/conversation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: chatType, name, participants_ids: selectedUsers }),
        })
            .then(response => {
                if (!response.ok) throw new Error('Could not create chat');
                return response.json();
            })
            .then(conversation => {
                navigation.navigate('Conversations', {
                    screen: 'Chat',
                    params: {
                        data: {
                            name: conversation.name,
                            conversationId: conversation.id,
                            participants: conversation.participants_ids,
                        },
                        senderName: yourName.trim() || 'You',
                    },
                });
            })
            .catch(() => Alert.alert('Could not start chat', 'Check that the chat server is running on this computer.'));
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Start a chat</Text>
            <Text style={styles.help}>Choose a person. They can open this same chat on their phone.</Text>

            <Text style={styles.label}>Your name</Text>
            <TextInput style={styles.input} value={yourName} onChangeText={setYourName} placeholder="Enter your name" />

            <View style={styles.types}>
                <TouchableOpacity style={[styles.typeButton, chatType === 'DM' && styles.selectedType]} onPress={() => chooseType('DM')}>
                    <Text style={[styles.typeText, chatType === 'DM' && styles.selectedText]}>One person</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, chatType === 'GROUP' && styles.selectedType]} onPress={() => chooseType('GROUP')}>
                    <Text style={[styles.typeText, chatType === 'GROUP' && styles.selectedText]}>Group</Text>
                </TouchableOpacity>
            </View>

            {chatType === 'GROUP' ? (
                <TextInput style={styles.input} value={chatName} onChangeText={setChatName} placeholder="Group name" />
            ) : null}

            <Text style={styles.label}>People</Text>
            {loading ? <ActivityIndicator color="#315EFB" /> : null}
            {users.map(user => {
                const selected = selectedUsers.includes(user.id);
                return (
                    <TouchableOpacity key={user.id} style={styles.user} onPress={() => selectUser(user.id)}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0)}</Text></View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.help}>{user.bio}</Text>
                        </View>
                        <Text style={styles.check}>{selected ? '✓' : '+'}</Text>
                    </TouchableOpacity>
                );
            })}

            {!loading && users.length === 0 ? <Text style={styles.help}>No people found. Check that the server is running.</Text> : null}

            <TouchableOpacity style={styles.startButton} onPress={startChat}>
                <Text style={styles.startText}>Start chatting</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { padding: 18, paddingBottom: 32 },
    title: { color: '#17212B', fontSize: 28, fontWeight: 'bold' },
    help: { color: '#74808C', fontSize: 14, marginTop: 5 },
    label: { color: '#17212B', fontSize: 15, fontWeight: '600', marginTop: 20, marginBottom: 8 },
    input: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginTop: 8, color: '#17212B' },
    types: { flexDirection: 'row', gap: 10, marginTop: 16 },
    typeButton: { backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
    selectedType: { backgroundColor: '#315EFB' },
    typeText: { color: '#17212B' },
    selectedText: { color: 'white', fontWeight: 'bold' },
    user: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderRadius: 14, marginBottom: 8 },
    avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#E8EDFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#315EFB', fontWeight: 'bold', fontSize: 18 },
    userDetails: { flex: 1 },
    userName: { color: '#17212B', fontWeight: '600', fontSize: 15 },
    check: { color: '#315EFB', fontSize: 22, fontWeight: 'bold' },
    startButton: { backgroundColor: '#315EFB', borderRadius: 13, padding: 15, alignItems: 'center', marginTop: 18 },
    startText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
