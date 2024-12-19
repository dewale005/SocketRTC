import WebSocket from 'ws';

/**
 * SocketRTCClient is a WebRTC-based client that connects to a WebSocket server for signaling.
 * It handles creating a peer-to-peer connection, exchanging ICE candidates, offers, and answers,
 * as well as managing media streams for video/audio communication.
 */
export class SocketRTCClient {
  private socket: WebSocket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private serverUrl: string;
  private eventListeners: Record<string, Function[]> = {};

  /**
   * Initializes the SocketRTCClient with the signaling server URL.
   * @param serverUrl The URL of the WebSocket signaling server.
   */
  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  /**
   * Connects to the signaling server using WebSocket.
   * Establishes event listeners for signaling messages from the server.
   */
  connect(): void {
    if (!this.serverUrl) {
      throw new Error('Server URL is not provided');
    }

    this.socket = new WebSocket(this.serverUrl);

    // Handle WebSocket open event
    this.socket.onopen = () => {
      console.log('Connected to signaling server');
    };

    // Handle incoming WebSocket messages (signaling messages)
    this.socket.onmessage = (event: WebSocket.MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string);
        this.handleSignalingMessage(message);
      } catch (error) {
        console.error('Failed to parse signaling message:', error);
      }
    };

    // Handle WebSocket close event
    this.socket.onclose = () => {
      console.log('Disconnected from signaling server');
    };

    // Handle WebSocket error event
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Emits an event to the signaling server via WebSocket.
   * @param event The event name.
   * @param data The data to be sent with the event.
   */
  emit(event: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ event, data });
      this.socket.send(message);
    } else {
      console.warn('WebSocket is not open. Cannot emit event:', event);
    }
  }

  /**
   * Registers a listener for a specific event.
   * @param event The event name.
   * @param listener The listener function to be called when the event is triggered.
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  /**
   * Triggers an event, calling all registered listeners for that event.
   * @param event The event name.
   * @param data The data to pass to the event listeners.
   */
  private trigger(event: string, data: any): void {
    const listeners = this.eventListeners[event] || [];
    listeners.forEach((listener) => listener(data));
  }

  /**
   * Handles incoming signaling messages (offer, answer, candidate).
   * @param message The signaling message from the server.
   */
  private handleSignalingMessage(message: { event: string; data: any }): void {
    const { event, data } = message;

    switch (event) {
      case 'offer':
        this.handleOffer(data);
        break;
      case 'answer':
        this.handleAnswer(data);
        break;
      case 'candidate':
        this.handleCandidate(data);
        break;
      default:
        console.warn('Unknown signaling event:', event);
        break;
    }
  }

  /**
   * Handles an incoming offer from another peer and creates an answer.
   * @param offer The received RTC offer.
   */
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    this.createPeerConnection();
    try {
      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection?.createAnswer();
      await this.peerConnection?.setLocalDescription(answer!);
      this.emit('answer', answer);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handles an incoming answer from another peer.
   * @param answer The received RTC answer.
   */
  private handleAnswer(answer: RTCSessionDescriptionInit): void {
    if (this.peerConnection) {
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer)).catch((error) => {
        console.error('Error setting remote description for answer:', error);
      });
    }
  }

  /**
   * Handles an incoming ICE candidate from another peer.
   * @param candidate The ICE candidate.
   */
  private handleCandidate(candidate: RTCIceCandidateInit): void {
    if (this.peerConnection) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((error) => {
        console.error('Error adding ICE candidate:', error);
      });
    }
  }

  /**
   * Creates a new peer-to-peer connection with WebRTC.
   */
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Handle ICE candidate events
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('candidate', event.candidate);
      }
    };

    // Handle incoming media tracks from the peer
    this.peerConnection.ontrack = (event) => {
      this.trigger('track', event.streams[0]);
    };

    // Add local media stream to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }
  }

  /**
   * Gets the user's media (video and audio) and assigns it to the local stream.
   */
  async getUserMedia(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.emit('stream', this.localStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }

  /**
   * Closes the WebSocket connection and the peer connection.
   */
  close(): void {
    if (this.socket) {
      this.socket.close();
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }
}
