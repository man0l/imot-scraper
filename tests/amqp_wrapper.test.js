// amqp_wrapper.test.js
const mockConnect = jest.fn();
const mockCreateChannel = jest.fn();
const mockAssertQueue = jest.fn();
const mockSendToQueue = jest.fn();
const mockConsume = jest.fn();

jest.mock('amqplib', () => ({
  connect: mockConnect,
}));

const AMQPWrapper = require('../src/libs/amqp_wrapper');
const config = require('../src/config/config');

describe('AMQPWrapper', () => {
  let amqp;

  beforeEach(() => {
    mockConnect.mockResolvedValue({
      createChannel: mockCreateChannel,
    });
    mockCreateChannel.mockResolvedValue({
      assertQueue: mockAssertQueue,
      sendToQueue: mockSendToQueue,
      consume: mockConsume,
    });
    amqp = new AMQPWrapper(config);
  });

  test('connect should be called with correct config', async () => {
    await amqp.connect();
    expect(mockConnect).toHaveBeenCalledWith(config.rabbitmqUrl);
  });

  test('publish should send message to correct queue', async () => {
    const queue = 'testQueue';
    const message = 'testMessage';
    await amqp.publish(queue, message);
    expect(mockAssertQueue).toHaveBeenCalledWith(queue, { durable: true });
    expect(mockSendToQueue).toHaveBeenCalledWith(queue, Buffer.from(message));
  });

  test('consume should consume message from correct queue', async () => {
    const queue = 'testQueue';
    const onMessage = jest.fn();
    await amqp.consume(queue, onMessage);
    expect(mockAssertQueue).toHaveBeenCalledWith(queue, { durable: true });
    expect(mockConsume).toHaveBeenCalledWith(queue, onMessage, { noAck: false });
  });

  // add more tests
  test('close should close connection', async () => {
    await amqp.close();
    expect(mockConnect).toHaveBeenCalled();
  });

  // test some negative cases

  test('connect should throw error if connection fails', async () => {
    mockConnect.mockRejectedValue(new Error('Connection failed'));
    await expect(amqp.connect()).rejects.toThrow('Connection failed');
  }
    );

 test('publish should throw error if connection is not established', async () => {

    await expect(amqp.publish('testQueue', 'testMessage')).rejects.toThrow('Connection is not established');
  }
    );

    test('consume should throw error if connection is not established', async () => {

    await expect(amqp.consume('testQueue', jest.fn())).rejects.toThrow('Connection is not established');
    }
    );
    
  
});
