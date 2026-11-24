import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../api';

export default function ConversationScreen({ navigation }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadConversations = () => {
        setLoading(true);
        setError(false);
        fetch(`${API_URL}/conversation`)
            .then(response => {
                if (!response.ok) throw new Error('Could not load chats');
                return response.json();
            })
            .then(data => setConversations(Array.isArray(data) ? data : []))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadConversations();
        const unsubscribe = navigation.addListener('focus', loadConversations);
        return unsubscribe;
    }, [navigation]);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Chats</Text>
            <Text style={styles.subtitle}>Your conversations</Text>

            {loading ? <Text style={styles.info}>Loading chats…</Text> : null}
            {error ? <Text style={styles.info}>Chat server is off. Start it with: npm run server</Text> : null}
            {!loading && !error && conversations.length === 0 ? <Text style={styles.info}>No chats yet. Tap “New Chat” to start one.</Text> : null}

            {conversations.map((item, index) => (
                <TouchableOpacity
                    key={item.id || index}
                    style={styles.card}
                    onPress={() => navigation.navigate('Chat', {
                        data: { name: item.name, conversationId: item.id, participants: item.participants_ids },
                    })}
                >
                    <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || 'C').charAt(0).toUpperCase()}</Text></View>
                    <View style={styles.details}>
                        <Text style={styles.name}>{item.name || 'New chat'}</Text>
                        <Text style={styles.info}>Tap to open chat</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { padding: 20 },
    title: { fontSize: 30, fontWeight: 'bold', color: '#17212B' },
    subtitle: { color: '#74808C', marginTop: 5, marginBottom: 20 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 14, marginBottom: 10 },
    avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E8EDFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#315EFB', fontSize: 18, fontWeight: 'bold' },
    details: { flex: 1 },
    name: { color: '#17212B', fontSize: 16, fontWeight: '600' },
    info: { color: '#74808C', fontSize: 13, marginTop: 5 },
    arrow: { color: '#74808C', fontSize: 24 },
});
