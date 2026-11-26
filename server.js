const http = require('http');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'chat-data.json');

function loadChatData() {
    try {
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch {
        return { conversations: [], messages: {} };
    }
}

const chatData = loadChatData();

const users = [
    { id: 'user-1', name: 'Parv', bio: 'Ready to chat' },
    { id: 'user-2', name: 'Aarav', bio: 'Classmate' },
    { id: 'user-3', name: 'Anaya', bio: 'Classmate' },
    { id: 'user-4', name: 'Riya', bio: 'Classmate' },
];

const conversations = chatData.conversations;
const messages = chatData.messages;

function saveChatData() {
    fs.writeFileSync(dataFile, JSON.stringify({ conversations, messages }, null, 2));
}

function sendJson(response, status, data) {
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    response.end(JSON.stringify(data));
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', part => { body += part; });
        request.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch (error) {
                reject(error);
            }
        });
        request.on('error', reject);
    });
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (request.method === 'OPTIONS') return sendJson(response, 200, {});

    if (request.method === 'GET' && url.pathname === '/user') {
        return sendJson(response, 200, users);
    }

    if (request.method === 'GET' && url.pathname === '/user/profile') {
        const user = users.find(item => item.id === url.searchParams.get('user_id'));
        return sendJson(response, user ? 200 : 404, user || { error: 'User not found' });
    }

    if (request.method === 'GET' && url.pathname === '/conversation') {
        return sendJson(response, 200, conversations);
    }

    if (request.method === 'POST' && url.pathname === '/conversation') {
        try {
            const body = await readBody(request);
            if (!body.participants_ids?.length) {
                return sendJson(response, 400, { error: 'Choose at least one person.' });
            }
            const conversation = {
                id: randomUUID(),
                name: body.name || 'New chat',
                type: body.type || 'DM',
                createdBy: 'user-1',
                participants_ids: ['user-1', ...body.participants_ids],
            };
            conversations.unshift(conversation);
            messages[conversation.id] = [];
            saveChatData();
            return sendJson(response, 201, conversation);
        } catch {
            return sendJson(response, 400, { error: 'Invalid conversation details.' });
        }
    }

    if (request.method === 'GET' && url.pathname === '/message') {
        const id = url.searchParams.get('conversation_id');
        return sendJson(response, 200, { data: messages[id] || [] });
    }

    if (request.method === 'POST' && url.pathname === '/message') {
        try {
            const body = await readBody(request);
            if (!messages[body.conversation_id]) {
                return sendJson(response, 404, { error: 'Chat not found.' });
            }
            if (!body.content && !body.imageInfo) {
                return sendJson(response, 400, { error: 'Message is empty.' });
            }
            const message = {
                id: randomUUID(),
                content: body.content || '',
                imageInfo: body.imageInfo || '',
                senderName: body.senderName || 'You',
                createdAt: new Date().toISOString(),
            };
            messages[body.conversation_id].push(message);
            saveChatData();
            return sendJson(response, 201, message);
        } catch {
            return sendJson(response, 400, { error: 'Invalid message.' });
        }
    }

    return sendJson(response, 404, { error: 'Not found.' });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Chat server running on port 3000');
    console.log('Keep this terminal open while using the app.');
});
