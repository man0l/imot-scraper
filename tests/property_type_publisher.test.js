const AMQPWrapper = require('../src/libs/amqp_wrapper');
const config = require('../src/config/config');
const { start, propertyTypes } = require('../src/jobs/property_type_publisher');
jest.useFakeTimers(); // Using fake timers

jest.mock('../src/libs/amqp_wrapper', () => jest.fn());
jest.mock('../src/libs/imotbg_scraper', () => jest.fn());
jest.mock('../src/config/config', () => ({
  rabbitmq: {
    host: 'mockHost',
    port: 'mockPort',
    user: 'mockUser',
    password: 'mockPassword',
    queue_property_types: 'mockQueue',
    queue_property_listings: 'mockQueue',
  }
}));

const mockConnect = jest.fn();
const mockConsume = jest.fn();
const mockSendToQueue = jest.fn();
const mockAck = jest.fn();
const mockClose = jest.fn();
AMQPWrapper.mockImplementation(() => ({
  connect: mockConnect,
  consume: mockConsume,
  sendToQueue: mockSendToQueue,
  close: mockClose,
  channel: {
    ack: mockAck,
  }
}));

describe('main', () => {
  let consoleErrorSpy;
  let exitSpy;
  beforeEach(() => {
     // Create a spy for console.error
     consoleErrorSpy = jest.spyOn(console, 'error');
     consoleErrorSpy.mockImplementation(() => {});

     // Reset the mock call count before each test
     mockConnect.mockClear();
     mockConsume.mockClear();
     mockSendToQueue.mockClear();
     mockAck.mockClear();
     exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore console.error to its original form
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should connect to AMQP and send property types to the queue', async () => {
    await start();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    Object.values(propertyTypes).forEach((url, index) => {
      expect(mockSendToQueue).toHaveBeenNthCalledWith(index + 1, config.rabbitmq.queue_property_types, url);
    });
    
    jest.runOnlyPendingTimers();
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should handle errors when connecting to AMQP', async () => {
    const error = new Error('AMQP connection error');
    mockConnect.mockImplementationOnce(() => Promise.reject(error)); 

    await start();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error in main:', error);
  });

});

