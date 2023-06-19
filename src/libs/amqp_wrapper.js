const amqp = require('amqplib');

class AMQPWrapper {
  constructor(config) {
    this.config = config;
  }

  async connect() {
    this.connection = await amqp.connect({
      hostname: this.config.rabbitmq.host,
      port: this.config.rabbitmq.port,
      username: this.config.rabbitmq.user,
      password: this.config.rabbitmq.password
    });
    this.channel = await this.connection.createChannel();
  }

  async sendToQueue(queue, message) {
    if (!this.channel) {
      await this.connect();
    }

    return this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async consume(queue, callback) {
    if (!this.channel) {
      await this.connect();
    }

    return this.channel.consume(queue, callback);
  }

  async close() {
    if (this.connection) {
      return this.connection.close();
    }
  }
}

module.exports = AMQPWrapper;
