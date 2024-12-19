import WebSocket, { Server, WebSocket as WSClient } from 'ws';

/**
 * SocketRTCServer is a WebSocket server that handles real-time communication between clients.
 * It manages multiple WebSocket connections, broadcasting messages to clients, and ensuring that
 * the server can scale and handle multiple connections reliably.
 */
export class SocketRTCServer {
  private wss: Server; // WebSocket server instance
  private clients: Set<WSClient>; // Set of connected clients

  /**
   * Initializes the WebSocket server and handles client connections.
   * @param port The port on which the WebSocket server will listen.
   */
  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.clients = new Set();

    // Set up the connection listener
    this.wss.on('connection', (ws: WSClient) => this.handleConnection(ws));
  }

  /**
   * Handles a new WebSocket client connection.
   * Registers event listeners for messages and close events.
   * @param ws The WebSocket client connection.
   */
  private handleConnection(ws: WSClient): void {
    this.clients.add(ws);
    console.log('New client connected');

    // Event listener for receiving messages
    ws.on('message', (message: string) => {
      this.handleMessage(ws, message);
    });

    // Event listener for handling client disconnections
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    // Event listener for WebSocket errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.removeClient(ws);
    });
  }

  /**
   * Handles incoming messages from clients. Currently, it broadcasts the message to all clients.
   * @param sender The WebSocket client that sent the message.
   * @param message The message received from the client.
   */
  private handleMessage(sender: WSClient, message: string): void {
    try {
      // Log received message for debugging purposes
      console.log('Received message:', message);

      // Broadcast message to all other clients
      this.broadcast(sender, message);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  /**
   * Broadcasts a message to all clients except the sender.
   * Ensures that only clients that are still connected (WebSocket.OPEN) receive the message.
   * @param sender The WebSocket client who sent the message.
   * @param message The message to be broadcasted.
   */
  private broadcast(sender: WSClient, message: string): void {
    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
      }
    });
  }

  /**
   * Handles a client disconnection by removing the client from the set of active clients.
   * @param ws The WebSocket client that disconnected.
   */
  private handleDisconnection(ws: WSClient): void {
    console.log('Client disconnected');
    this.removeClient(ws);
  }

  /**
   * Removes a client from the set of active clients and logs the disconnection.
   * @param ws The WebSocket client to be removed.
   */
  private removeClient(ws: WSClient): void {
    if (this.clients.has(ws)) {
      this.clients.delete(ws);
    }
  }

  /**
   * Closes the WebSocket server and all client connections.
   */
  public close(): void {
    this.wss.close(() => {
      console.log('WebSocket server closed');
    });

    // Close all client connections
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
  }
}
