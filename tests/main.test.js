const puppeteer = require('puppeteer');
const AMQPWrapper = require('../src/libs/amqp_wrapper');
const ImotBGScraper = require('../src/libs/imotbg_scraper');
const config = require('../src/config/config');

const { main } = require('../main');

jest.mock('puppeteer');
jest.mock('../src/libs/amqp_wrapper');
jest.mock('../src/libs/imotbg_scraper');
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

let mockBrowser;
let mockAMQP;
let mockScraper;

beforeEach(() => {
  mockBrowser = { };
  mockAMQP = { connect: jest.fn(), consume: jest.fn(), sendToQueue: jest.fn(), channel: { ack: jest.fn() } };
  mockScraper = { scrapePropertyLinks: jest.fn() };

  puppeteer.launch.mockResolvedValue(mockBrowser);
  AMQPWrapper.mockImplementation(() => mockAMQP);
  ImotBGScraper.mockImplementation(() => mockScraper);
});

describe('main function', () => {
  test('should connect to AMQP', async () => {
    await main(mockAMQP, mockScraper);
    expect(mockAMQP.connect).toHaveBeenCalled();
  });

  test('should consume from queue', async () => {
    await main(mockAMQP, mockScraper);
    expect(mockAMQP.consume).toHaveBeenCalledWith(config.rabbitmq.queue_property_types, expect.any(Function), { noAck: false });
  });

  test('should handle property links', async () => {
    const mockPropertyLinks = ['link1', 'link2'];
    mockScraper.scrapePropertyLinks.mockResolvedValue(mockPropertyLinks);

    await main(mockAMQP, mockScraper);

    const consumeCallback = mockAMQP.consume.mock.calls[0][1];
    for (const link of mockPropertyLinks) {
      await consumeCallback({ content: { toString: () => link } });
      expect(mockAMQP.sendToQueue).toHaveBeenCalledWith(config.rabbitmq.queue_property_listings, link);
    }
  });
});
