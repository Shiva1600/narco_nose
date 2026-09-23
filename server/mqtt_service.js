const mqtt = require('mqtt');
const EventEmitter = require('events');

class MqttService extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.isConnected = false;
    const initialHost = process.env.PI_IP || process.env.MQTT_HOST || '127.0.0.1';
    const initialPort = process.env.MQTT_PORT || '1883';
    this.brokerUrl = process.env.MQTT_BROKER_URL || process.env.MQTT_URL || `mqtt://${initialHost}:${initialPort}`;
    this.topicPrefix = process.env.MQTT_TOPIC_PREFIX || 'narconose/';
    this.lastPing = Date.now();
    this.reconnectAttempts = 0;
  }

  reconnect(options = {}) {
    console.log('[MQTT] Reconnecting to broker with new options:', options);
    if (this.client) {
      try {
        const oldClient = this.client;
        oldClient.on('error', () => {}); // Catch and suppress lingering errors on closing client
        oldClient.end(true);
      } catch (e) {}
      this.client = null;
    }
    this.isConnected = false;
    this.emit('connection_change', { connected: false, message: 'Reconnecting...' });
    this.init(options);
  }

  init(options = {}) {
    if (options.host) {
      const port = options.port || 1883;
      // Strip protocol if user pasted mqtt://
      const cleanHost = options.host.replace(/^mqtt:\/\//, '').replace(/:.*$/, '');
      this.brokerUrl = `mqtt://${cleanHost}:${port}`;
    }
    if (options.topicPrefix) {
      this.topicPrefix = options.topicPrefix;
    }

    console.log(`[MQTT] Attempting connection to ${this.brokerUrl}...`);
    try {
      this.client = mqtt.connect(this.brokerUrl, {
        connectTimeout: 4000,
        reconnectPeriod: 10000,
        clientId: 'narco_nose_web_' + Math.random().toString(16).substring(2, 8)
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log(`[MQTT] Connected successfully to ${this.brokerUrl}`);
        this.subscribeTopics();
        this.emit('connection_change', { connected: true, broker: this.brokerUrl });
      });

      this.client.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          this.emit('message', { topic, payload });

          if (topic.includes('telemetry')) {
            this.emit('telemetry', payload);
          } else if (topic.includes('gps')) {
            this.emit('gps', payload);
          } else if (topic.includes('diagnostics')) {
            this.emit('diagnostics', payload);
          } else if (topic.includes('camera')) {
            this.emit('camera', payload);
          }
        } catch (e) {
          console.warn(`[MQTT] Non-JSON message on ${topic}:`, message.toString());
        }
      });

      this.client.on('error', (err) => {
        console.warn(`[MQTT] Broker notice (${this.brokerUrl}):`, err.message);
        this.isConnected = false;
        this.emit('connection_change', { connected: false, error: err.message, broker: this.brokerUrl });
      });

      this.client.on('offline', () => {
        this.isConnected = false;
        this.emit('connection_change', { connected: false });
      });

    } catch (err) {
      console.warn('[MQTT] Initialization notice:', err.message);
      this.isConnected = false;
    }
  }

  subscribeTopics() {
    if (!this.client || !this.isConnected) return;
    const topics = [
      `${this.topicPrefix}telemetry`,
      `${this.topicPrefix}gps`,
      `${this.topicPrefix}camera/yolo`,
      `${this.topicPrefix}system/diagnostics`,
      `${this.topicPrefix}actuators/status`
    ];

    topics.forEach(t => {
      this.client.subscribe(t, (err) => {
        if (!err) console.log(`[MQTT] Subscribed to topic: ${t}`);
      });
    });
  }

  publish(subtopic, payload) {
    const fullTopic = `${this.topicPrefix}${subtopic}`;
    const message = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);

    if (this.client && this.isConnected) {
      this.client.publish(fullTopic, message, { qos: 1 }, (err) => {
        if (err) console.error(`[MQTT] Publish error on ${fullTopic}:`, err);
        else console.log(`[MQTT] Published to ${fullTopic}:`, message);
      });
    } else {
      console.log(`[MQTT Sim-Bridge] Dispatched ${fullTopic}:`, message);
    }

    // Always emit internally so simulation and UI stay in sync
    this.emit('actuator_command', { topic: fullTopic, payload });
  }

  getStatus() {
    return {
      connected: this.isConnected,
      broker: this.brokerUrl,
      prefix: this.topicPrefix
    };
  }
}

module.exports = new MqttService();
