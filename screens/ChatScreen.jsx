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

const API = 'http://10.7.1.89:3000';

const ChatScreen = ({ route }) => {
    const conversation = route.params.data;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/message?conversation_id=${conversation.conversationId}`, {
            headers: { authorization: 'Basic first:second' },
        })
            .then(response => response.json())
            .then(data => setMessages(data.data || data))
            .catch(() => Alert.alert('Error', 'Could not load messages.'))
            .finally(() => setLoading(false));
    }, [conversation.conversationId]);

    const sendMessage = () => {
        const text = message.trim();
        if (!text) return;

        fetch(`${API}/message`, {
            method: 'POST',
            headers: {
                Authorization: 'Basic first:second',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversation.conversationId,
                content: text,
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error('Could not send message');
                setMessages(oldMessages => [...oldMessages, { content: text }]);
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

        fetch(`${API}/message`, {
            method: 'POST',
            headers: {
                Authorization: 'Basic first:second',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversation.conversationId,
                imageInfo: image.base64,
            }),
        })
            .then(() => setMessages(oldMessages => [...oldMessages, { imageInfo: image.uri }]))
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
                {!loading && messages.length === 0 ? <Text style={styles.hint}>Say hello to start chatting.</Text> : null}

                {messages.map((item, index) => (
                    <View key={item.id || index} style={styles.bubble}>
                        {item.content ? <Text style={styles.messageText}>{item.content}</Text> : null}
                        {item.imageInfo ? (
                            <Image
                                source={{
                                    uri: item.imageInfo.startsWith('http') || item.imageInfo.startsWith('file:')
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
