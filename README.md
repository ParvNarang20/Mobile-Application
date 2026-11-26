# Mobile Application

A simple class project chat app built with Expo and React Native.

## Features

- Browse conversations and open a chat
- Create direct and group conversations with users
- Send text messages and choose images
- Camera and image picker demo screens

## Run the app

```bash
npm install
npm start
```

## Run the chat server

Open another terminal in this folder and run:

```bash
npm run server
```

Keep the server running while chatting. Phones and the computer running the server must be on the same Wi-Fi. Chats are saved in `chat-data.json`. If the computer's Wi-Fi address changes, update `API_URL` in `api.js` to that address.

Use the Expo Go app to open the project, or run `npm run android` / `npm run ios` for a native development build.
