const puppeteer = require('puppeteer');
const AMQPWrapper = require('../src/libs/amqp_wrapper');
const ImotBGScraper = require('../src/libs/imotbg_scraper');
const config = require('../src/config/config');

const {main} = require('../main');

// Mock dependencies
jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}));
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


// Mock methods and properties
puppeteer.launch.mockResolvedValue({
  newPage: jest.fn().mockResolvedValue({}),
});
const mockConnect = jest.fn();
const mockConsume = jest.fn();
const mockSendToQueue = jest.fn();
const mockAck = jest.fn();
AMQPWrapper.mockImplementation(() => ({
  connect: mockConnect,
  consume: mockConsume,
  sendToQueue: mockSendToQueue,
  channel: {
    ack: mockAck,
  }
}));
ImotBGScraper.mockImplementation(() => ({
  scrapePropertyLinks: jest.fn(),
}));

describe('main function', () => {
  beforeEach(() => {
    // Reset the mock call count before each test
    mockConnect.mockClear();
    mockConsume.mockClear();
    mockSendToQueue.mockClear();
    mockAck.mockClear();
  });

  test('should connect to AMQP', async () => {
    await main();
    expect(mockConnect).toHaveBeenCalled();
  });

  test('should consume from queue', async () => {
    await main();
    expect(mockConsume).toHaveBeenCalledWith(config.rabbitmq.queue_property_types, expect.any(Function), { noAck: false });
  });

  test('should handle property links', async () => {
    // Prepare
    const mockPropertyLinks = ['link1', 'link2'];
  
    // Create a mock instance of ImotBGScraper for each link in mockPropertyLinks
    ImotBGScraper.mockImplementation(() => ({
      scrapePropertyLinks: jest
        .fn()
        .mockImplementation((url) =>
          Promise.resolve(mockPropertyLinks.includes(url) ? [url] : [])
        ),
    }));
  
    // Action
    await main();
  
    // Validate
    const consumeCallback = mockConsume.mock.calls[0][1];
    for (const link of mockPropertyLinks) {
      await consumeCallback({ content: { toString: () => link } });
      expect(mockSendToQueue).toHaveBeenCalledWith(
        config.rabbitmq.queue_property_listings,
        link
      );
      mockSendToQueue.mockClear();
    }
  });
   
});
