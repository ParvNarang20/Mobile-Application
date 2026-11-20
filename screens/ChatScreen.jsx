import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API = 'http://10.7.1.89:3000';
const COLORS = { background: '#F5F7FA', ink: '#17212B', muted: '#74808C', accent: '#315EFB', white: '#FFFFFF', border: '#E7EBF0' };

const ChatScreen = ({ route }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentMessage, setCurrentMessage] = useState('');
    const [participantsName, setParticipantsName] = useState([]);
    const [sending, setSending] = useState(false);
    const conversation = route.params.data;

    useEffect(() => {
        fetch(`${API}/message?conversation_id=${conversation.conversationId}`, {
            headers: { authorization: 'Basic first:second' },
        })
            .then(response => response.json())
            .then(data => setMessages(Array.isArray(data) ? data : data.data || []))
            .catch(() => setError('Couldn’t load messages. Please try again.'))
            .finally(() => setLoading(false));

        Promise.all((conversation.participants || []).map(id =>
            fetch(`${API}/user/profile?user_id=${id}`, { headers: { Authorization: 'Basic first:second' } })
                .then(response => response.json())
                .then(profile => profile.name)
                .catch(() => null)
        )).then(names => setParticipantsName(names.filter(Boolean)));
    }, [conversation.conversationId]);

    const sendMessage = async () => {
        const content = currentMessage.trim();
        if (!content || sending) return;
        setSending(true);
        try {
            const response = await fetch(`${API}/message`, {
                method: 'POST',
                headers: { Authorization: 'Basic first:second', 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation_id: conversation.conversationId, content }),
            });
            if (!response.ok) throw new Error('Message could not be sent.');
            setMessages(previous => [...previous, { content }]);
            setCurrentMessage('');
        } catch {
            Alert.alert('Message not sent', 'Please check your connection and try again.');
        } finally {
            setSending(false);
        }
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Allow photo access to choose an image.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        setMessages(previous => [...previous, { imageInfo: asset.uri }]);
        fetch(`${API}/message`, {
            method: 'POST',
            headers: { Authorization: 'Basic first:second', 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation_id: conversation.conversationId, imageInfo: asset.base64 }),
        }).catch(() => Alert.alert('Image not sent', 'Please check your connection and try again.'));
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
            <View style={styles.chatHeading}>
                <Text style={styles.groupName}>{conversation.name || 'Conversation'}</Text>
                <Text style={styles.memberNames}>{participantsName.length ? participantsName.join(' · ') : 'Your conversation'}</Text>
            </View>
            {loading ? (
                <View style={styles.centerState}><ActivityIndicator color={COLORS.accent} /><Text style={styles.helperText}>Loading messages…</Text></View>
            ) : error ? (
                <View style={styles.centerState}><Text style={styles.helperText}>{error}</Text></View>
            ) : (
                <ScrollView style={styles.messageArea} contentContainerStyle={styles.messageContent}>
                    {messages.length === 0 ? (
                        <View style={styles.emptyState}><Text style={styles.emptyTitle}>Say hello 👋</Text><Text style={styles.helperText}>Your messages will show up here.</Text></View>
                    ) : messages.map((message, index) => (
                        <View key={message.id ?? index} style={styles.messageRow}>
                            <View style={styles.bubble}>
                                {message.content ? <Text style={styles.messageText}>{message.content}</Text> : null}
                                {message.imageInfo ? <Image source={{ uri: message.imageInfo.startsWith('data:') || message.imageInfo.startsWith('http') || message.imageInfo.startsWith('file:') ? message.imageInfo : `data:image/jpeg;base64,${message.imageInfo}` }} style={styles.messageImage} /> : null}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
            <View style={styles.composer}>
                <TouchableOpacity onPress={pickImage} style={styles.imageButton} accessibilityLabel="Choose an image">
                    <Text style={styles.imageButtonText}>＋</Text>
                </TouchableOpacity>
                <TextInput
                    placeholder="Write a message…"
                    placeholderTextColor="#9AA4AF"
                    style={styles.input}
                    value={currentMessage}
                    onChangeText={setCurrentMessage}
                    multiline
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity onPress={sendMessage} disabled={!currentMessage.trim() || sending} style={[styles.sendButton, (!currentMessage.trim() || sending) && styles.sendButtonDisabled]}>
                    <Text style={styles.sendText}>{sending ? '…' : 'Send'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    chatHeading: { paddingHorizontal: 18, paddingVertical: 14, backgroundColor: COLORS.white, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
    groupName: { color: COLORS.ink, fontWeight: '700', fontSize: 16 },
    memberNames: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
    messageArea: { flex: 1 },
    messageContent: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
    messageRow: { alignItems: 'flex-start', marginVertical: 5 },
    bubble: { maxWidth: '85%', backgroundColor: COLORS.white, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, borderBottomLeftRadius: 5, paddingHorizontal: 14, paddingVertical: 10 },
    messageText: { color: COLORS.ink, fontSize: 15, lineHeight: 21 },
    messageImage: { width: 190, height: 190, borderRadius: 10, marginTop: 4 },
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
    emptyState: { alignItems: 'center', marginBottom: 24, gap: 7 },
    emptyTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '600' },
    helperText: { color: COLORS.muted, fontSize: 14 },
    composer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
    imageButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EEF1F6', alignItems: 'center', justifyContent: 'center' },
    imageButtonText: { color: COLORS.accent, fontSize: 25, lineHeight: 28, fontWeight: '400' },
    input: { flex: 1, minHeight: 42, maxHeight: 110, backgroundColor: '#F4F6F8', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.ink, fontSize: 15 },
    sendButton: { height: 42, paddingHorizontal: 15, borderRadius: 14, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
    sendButtonDisabled: { backgroundColor: '#AEBBF7' },
    sendText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
});

export default ChatScreen;
