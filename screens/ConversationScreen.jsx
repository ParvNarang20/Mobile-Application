import { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

const COLORS = {
    background: '#F5F7FA',
    ink: '#17212B',
    muted: '#74808C',
    accent: '#315EFB',
    border: '#E7EBF0',
    white: '#FFFFFF',
};

const ConversationScreen = ({ navigation }) => {
    const [conversation, setConversation] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch('http://10.7.1.89:3000/conversation', {
            method: 'GET',
            headers: { authorization: 'Basic first:second' },
        })
            .then(response => response.json())
            .then(async data => {
                const conversations = await Promise.all(data.map(async item => {
                    try {
                        const response = await fetch(`http://10.7.1.89:3000/user/profile?user_id=${item.createdBy}`, {
                            headers: { Authorization: 'Basic first:second' },
                        });
                        const profile = await response.json();
                        return { ...item, creatorName: profile.name };
                    } catch {
                        return { ...item, creatorName: 'Unknown' };
                    }
                }));
                setConversation(conversations);
                setLoading(false);
            })
            .catch(err => {
                setError(true);
                setLoading(false);
            });
    }, []);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.intro}>
                <Text style={styles.eyebrow}>YOUR SPACE</Text>
                <Text style={styles.heading}>Messages</Text>
                <Text style={styles.subheading}>Pick up where your conversations left off.</Text>
            </View>

            {loading ? (
                <View style={styles.stateBox}><ActivityIndicator color={COLORS.accent} /><Text style={styles.stateText}>Loading conversations…</Text></View>
            ) : error ? (
                <View style={styles.stateBox}><Text style={styles.stateTitle}>Couldn’t load conversations</Text><Text style={styles.stateText}>Please check your connection and try again.</Text></View>
            ) : conversation.length === 0 ? (
                <View style={styles.stateBox}><Text style={styles.stateTitle}>No conversations yet</Text><Text style={styles.stateText}>Start a chat with someone to see it here.</Text></View>
            ) : (
                <View style={styles.list}>
                    {conversation.map((item, index) => (
                        <TouchableOpacity
                            key={item.id ?? index}
                            activeOpacity={0.75}
                            style={styles.card}
                            onPress={() => navigation.navigate('Chat', {
                                data: { name: item.name, conversationId: item.id, participants: item.participants_ids },
                            })}
                        >
                            <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || 'C').trim().charAt(0).toUpperCase()}</Text></View>
                            <View style={styles.cardCopy}>
                                <Text style={styles.cardTitle} numberOfLines={1}>{item.name || 'Untitled conversation'}</Text>
                                <Text style={styles.cardDetail} numberOfLines={1}>Started by {item.creatorName || 'Unknown'}</Text>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingBottom: 32 },
    intro: { marginTop: 12, marginBottom: 24 },
    eyebrow: { color: COLORS.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
    heading: { color: COLORS.ink, fontSize: 30, fontWeight: '700' },
    subheading: { color: COLORS.muted, fontSize: 14, marginTop: 7 },
    list: { gap: 11 },
    card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#E8EDFF', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
    avatarText: { color: COLORS.accent, fontSize: 18, fontWeight: '700' },
    cardCopy: { flex: 1 },
    cardTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '600', marginBottom: 5 },
    cardDetail: { color: COLORS.muted, fontSize: 13 },
    chevron: { color: '#A3ADB8', fontSize: 26, marginLeft: 8, marginTop: -3 },
    stateBox: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, minHeight: 140, alignItems: 'center', justifyContent: 'center', padding: 22, gap: 9 },
    stateTitle: { color: COLORS.ink, fontWeight: '600', fontSize: 16 },
    stateText: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },
});

export default ConversationScreen;
