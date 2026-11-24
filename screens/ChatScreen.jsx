import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../api';

const ChatScreen = ({ route }) => {
    const conversation = route.params.data;
    const senderName = route.params.senderName || 'You';
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState(false);

    useEffect(() => {
        const loadMessages = () => {
            fetch(`${API_URL}/message?conversation_id=${conversation.conversationId}`)
                .then(response => response.json())
                .then(data => {
                    setMessages(data.data || data);
                    setServerError(false);
                })
                .catch(() => setServerError(true))
                .finally(() => setLoading(false));
        };

        loadMessages();
        const timer = setInterval(loadMessages, 2000);
        return () => clearInterval(timer);
    }, [conversation.conversationId]);

    const sendMessage = () => {
        const text = message.trim();
        if (!text) return;

        fetch(`${API_URL}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversation.conversationId,
                content: text,
                senderName,
            }),
        })
            .then(response => response.json())
            .then(sentMessage => {
                if (sentMessage.error) throw new Error(sentMessage.error);
                setMessages(oldMessages => [...oldMessages, sentMessage]);
                setMessage('');
            })
            .catch(() => Alert.alert('Error', 'Message was not sent.'));
    };

    const chooseImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Allow access to photos to choose an image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            base64: true,
        });

        if (result.canceled) return;
        const image = result.assets[0];

        fetch(`${API_URL}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversation.conversationId,
                imageInfo: image.base64,
                senderName,
            }),
        })
            .then(response => response.json())
            .then(sentMessage => {
                if (sentMessage.error) throw new Error(sentMessage.error);
                setMessages(oldMessages => [...oldMessages, sentMessage]);
            })
            .catch(() => Alert.alert('Error', 'Image was not sent.'));
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text style={styles.title}>{conversation.name || 'Conversation'}</Text>

            <ScrollView style={styles.messages} contentContainerStyle={styles.messageList}>
                {loading ? <Text style={styles.hint}>Loading messages…</Text> : null}
                {serverError ? <Text style={styles.hint}>Chat server is off. Start it with: npm run server</Text> : null}
                {!loading && !serverError && messages.length === 0 ? <Text style={styles.hint}>Say hello to start chatting.</Text> : null}

                {messages.map((item, index) => (
                    <View key={item.id || index} style={[styles.bubble, item.senderName === senderName && styles.myBubble]}>
                        <Text style={styles.sender}>{item.senderName || 'Someone'}</Text>
                        {item.content ? <Text style={styles.messageText}>{item.content}</Text> : null}
                        {item.imageInfo ? (
                            <Image
                                source={{
                                    uri: item.imageInfo.startsWith('http') || item.imageInfo.startsWith('file:') || item.imageInfo.startsWith('data:')
                                        ? item.imageInfo
                                        : `data:image/jpeg;base64,${item.imageInfo}`,
                                }}
                                style={styles.image}
                            />
                        ) : null}
                    </View>
                ))}
            </ScrollView>

            <View style={styles.composer}>
                <TouchableOpacity style={styles.imageButton} onPress={chooseImage}>
                    <Text style={styles.imageButtonText}>+</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Write a message…"
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F5F7FA' },
    title: { padding: 16, color: '#17212B', fontSize: 17, fontWeight: 'bold', backgroundColor: 'white' },
    messages: { flex: 1 },
    messageList: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
    hint: { color: '#74808C', textAlign: 'center', marginVertical: 12 },
    bubble: { alignSelf: 'flex-start', maxWidth: '85%', backgroundColor: 'white', borderRadius: 14, padding: 12, marginBottom: 8 },
    myBubble: { alignSelf: 'flex-end', backgroundColor: '#E8EDFF' },
    sender: { color: '#74808C', fontSize: 11, marginBottom: 4 },
    messageText: { color: '#17212B', fontSize: 15 },
    image: { width: 180, height: 180, borderRadius: 10 },
    composer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: 'white' },
    imageButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E8EDFF', alignItems: 'center', justifyContent: 'center' },
    imageButtonText: { color: '#315EFB', fontSize: 24 },
    input: { flex: 1, backgroundColor: '#F5F7FA', borderRadius: 12, paddingHorizontal: 12, marginHorizontal: 8 },
    sendButton: { backgroundColor: '#315EFB', borderRadius: 12, padding: 12 },
    sendText: { color: 'white', fontWeight: 'bold' },
});

export default ChatScreen;
