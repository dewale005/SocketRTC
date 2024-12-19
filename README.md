Here is an updated **`README.md`** for the **SocketRTC** project, reflecting the latest changes and improvements in the **`SocketRTCServer`** class and overall functionality:

---

# **SocketRTC**

**SocketRTC** is a real-time communication library that leverages **WebRTC** and **WebSocket** for peer-to-peer communication and signaling. It allows you to create real-time applications like video calls, chat systems, and live data streaming with minimal setup.

### **Features**

- **WebSocket Integration**: Signaling and message exchange between clients using WebSocket.
- **WebRTC Support**: Peer-to-peer video/audio communication.
- **Socket.IO-like API**: Simplified and familiar API for real-time communication.
- **Scalable Communication**: The WebSocket server can scale to multiple clients.
- **Error Handling**: Proper error handling and logging to ensure smooth communication.

### **Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Server-Side Example](#server-side-example)
  - [Client-Side Example](#client-side-example)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [License](#license)

---

## **Installation**

To install **SocketRTC** in your project, use the following command:

```bash
npm install socketrtc
```

Make sure to also install dependencies for WebRTC and WebSocket if needed:

```bash
npm install ws
```

---

## **Usage**

### **Server-Side Example**

**`SocketRTCServer`** class is a WebSocket server that handles the real-time communication between clients. The server listens on a specific port, accepts client connections, and broadcasts messages to other clients. Here's an example of setting up the server:

```typescript
import { SocketRTCServer } from 'socketrtc';

// Instantiate the server and listen on port 8080
const server = new SocketRTCServer(8080);
console.log('WebSocket server running on ws://localhost:8080');

// To gracefully close the server and all connections
server.close();
```

The server will broadcast all received messages to every other connected client except the sender. It also handles client disconnections and WebSocket errors properly.

### **Client-Side Example**

**`SocketRTCClient`** class connects to the WebSocket signaling server and manages WebRTC peer connections. Here's an example of how you can use the client in your application:

```typescript
import { SocketRTCClient } from 'socketrtc';

const socketRTCClient = new SocketRTCClient('ws://localhost:8080');

// Connect to the WebSocket signaling server
socketRTCClient.connect();

// Get local media (video + audio)
socketRTCClient.getUserMedia();

// Handle incoming media stream
socketRTCClient.on('stream', (stream) => {
  const localVideo = document.getElementById('localVideo');
  localVideo.srcObject = stream;
});

// Handle peer-to-peer media track
socketRTCClient.on('track', (stream) => {
  const remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.srcObject = stream;
});

// Send a message using the WebRTC data channel
socketRTCClient.sendData("Hello from the client!");
```

### **Error Handling**

The **`SocketRTCClient`** and **`SocketRTCServer`** classes have robust error handling to ensure smooth operation. Here's a summary:

- **WebSocket Errors**: Errors are captured and logged when the WebSocket connection fails or a client disconnects unexpectedly.
- **WebRTC Errors**: Errors in setting remote descriptions, handling ICE candidates, or adding tracks are logged with clear messages for debugging.
- **Message Processing**: Incoming messages are validated before being processed. If a message cannot be parsed or handled, it is logged, and the operation is skipped.

---

## **API Documentation**

### **SocketRTCClient**

#### `connect()`
- **Description**: Connects the client to the signaling WebSocket server.

#### `emit(event: string, data: any)`
- **Description**: Sends an event to the signaling server with the provided data.

#### `on(event: string, listener: Function)`
- **Description**: Registers an event listener to handle incoming events such as `stream`, `track`, and `data`.

#### `getUserMedia()`
- **Description**: Accesses the user's media (audio/video) and triggers the `stream` event with the local media stream.

#### `sendData(message: string)`
- **Description**: Sends data over the WebRTC data channel to the peer.

#### `close()`
- **Description**: Closes the WebSocket connection and the peer connection.

---

### **SocketRTCServer**

#### `constructor(port: number)`
- **Description**: Initializes the WebSocket server on the specified port.

#### `close()`
- **Description**: Gracefully shuts down the WebSocket server and disconnects all connected clients.

---

## **Error Handling**

**SocketRTC** has comprehensive error handling mechanisms for both WebSocket and WebRTC operations. All errors are logged with clear messages to facilitate debugging:

- **WebSocket Errors**: Errors in establishing or maintaining the WebSocket connection are captured and logged.
- **WebRTC Errors**: Errors in setting remote descriptions, creating offers/answers, or managing ICE candidates are logged for debugging.
- **Message Handling Errors**: If an incoming signaling message cannot be parsed or processed, an error is logged, and the operation is skipped.

---

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### **Conclusion**

This update improves the **SocketRTC** package by optimizing the WebSocket server and client for better scalability, maintainability, and error handling. The updated API makes it easier to set up peer-to-peer WebRTC communication while providing robust event management and error logging.

You can now build real-time communication applications with features like video/audio calls, messaging, and more, using the simple and extensible **SocketRTC** library.

Let me know if you need further modifications or additional features!