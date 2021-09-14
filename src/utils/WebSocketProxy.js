class WebSocketProxy {
  constructor(cfg) {
    this.config = cfg;
    try {
      this.messages = [];
      this.connectServer();
    } catch (err) {
      this.config.disconnect();
    }
  }

  close() {
    if (this.wsInstance) {
      this.config = null;
      this.wsInstance.close();
    }
  }

  connectServer() {
    this.wsInstance = new WebSocket("ws://" + this.config.url);
    this.wsInstance.onmessage = (e) => {
      const m = JSON.parse(e.data);
      this.config.onmessage(m);
    };
    this.wsInstance.onclose = () => this.reconnect();
    this.wsInstance.onopen = () => this.connected();
  }
  reconnect() {
    if (this.reconnectCount >= 3 || !this.config) {
      this.reconnectCount = 0;
      this.config.disconnect();
    } else {
      this.config.reconnect();
      this.reconnectCount++;
      this.connectServer();
    }
  }

  connected = () => {
    this.reconnectCount = 0;
    this.config.connected();
    if (this.messages)
      while (this.messages.length) {
        const m = this.messages.shift();
        this.sendData(m.path, m.data);
      }
  };

  sendData(path, data) {
    return new Promise((resolve, reject) => {
      if (
        this.wsInstance == null ||
        this.wsInstance.readyState != WebSocket.OPEN
      ) {
        this.messages.push({ path, data });
        resolve();
      } else {
        try {
          this.wsInstance.send(JSON.stringify({ path, data }));
          resolve();
        } catch (err) {
          console.log("error     ", err);
          reject(err);
        }
      }
    });
  }
}

export default WebSocketProxy;
