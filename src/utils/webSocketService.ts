export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};

  constructor(url: string) {
    this.url = url;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket Connected');
        resolve();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        reject(error);
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { type, data, step, message: msgContent } = message;

        // Map Python's step/progress output to the frontend's expected 'StepGenerated'
        if (type === 'step' || type === 'progress' || step || (type === 'progress' && msgContent)) {
          this.trigger('StepGenerated', step || msgContent || data);
        }

        if (type === 'complete') {
          this.trigger('Complete', data);
        }
        
        if (type === 'error') {
          this.trigger('Error', message.message || message.detail);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket Disconnected');
      };
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string) {
    delete this.listeners[event];
  }

  private trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  send(action: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...payload }));
    }
  }

  stop() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Get WebSocket URL from backend URL
const getWsUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
  const wsUrl = backendUrl.replace('http', 'ws').replace('/api/v1', '/api/v1/generators/ws/generate');
  return wsUrl;
};

export const webSocketService = new WebSocketService(getWsUrl());
