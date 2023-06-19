// main.test.js
const puppeteer = require('puppeteer');
const AMQPWrapper = require('../src/libs/amqp_wrapper');
const ImotBGScraper = require('../src/libs/imotbg_scraper');
const FileManager = require('../src/libs/file_manager');
const config = require('../src/config/config');
const main = require('../main');

jest.mock('puppeteer');
jest.mock('../src/libs/amqp_wrapper');
jest.mock('../src/libs/imotbg_scraper');
jest.mock('../src/libs/file_manager');

describe('main', () => {
  let browser;
  let page;
  let amqp;
  let connection;
  let channel;
  let scraper;

  beforeEach(() => {
    page = {};
    browser = { newPage: jest.fn().mockResolvedValue(page) };
    puppeteer.launch.mockResolvedValue(browser);
    channel = { assertQueue: jest.fn(), consume: jest.fn() };
    connection = { createChannel: jest.fn().mockResolvedValue(channel) };
    amqp = { connect: jest.fn().mockResolvedValue(connection) };
    AMQPWrapper.mockImplementation(() => amqp);
    scraper = { scrapePropertyDetails: jest.fn() };
    ImotBGScraper.mockImplementation(() => scraper);
    FileManager.appendToFile = jest.fn();
  });

  it('should establish AMQP connection and channel', async () => {
    await main();
    expect(AMQPWrapper).toHaveBeenCalledWith(config);
    expect(amqp.connect).toHaveBeenCalled();
    expect(connection.createChannel).toHaveBeenCalled();
  });

  it('should launch puppeteer browser and create a new page', async () => {
    await main();
    expect(puppeteer.launch).toHaveBeenCalled();
    expect(browser.newPage).toHaveBeenCalled();
  });

  it('should consume messages from the queue and process them', async () => {
    const msg = { content: Buffer.from('test-url') };
    channel.consume.mockImplementationOnce((queue, onMessage) => onMessage(msg));
    scraper.scrapePropertyDetails.mockResolvedValue('test-details');
    await main();
    expect(channel.consume).toHaveBeenCalledWith('propertyUrlsQueue', expect.any(Function), { noAck: false });
    expect(scraper.scrapePropertyDetails).toHaveBeenCalledWith('test-url', scraper.detailsXPaths);
    expect(FileManager.appendToFile).toHaveBeenCalledWith('propertyDetails.txt', 'test-details');
  });

  it('should handle errors when connecting to AMQP', async () => {
    amqp.connect.mockRejectedValueOnce(new Error('AMQP connection error'));
    await main();
    expect(console.error).toHaveBeenCalledWith('Error in main:', new Error('AMQP connection error'));
  });

  it('should handle errors when launching puppeteer', async () => {
    puppeteer.launch.mockRejectedValueOnce(new Error('Puppeteer launch error'));
    await main();
    expect(console.error).toHaveBeenCalledWith('Error in main:', new Error('Puppeteer launch error'));
  });

  it('should handle errors when scraping property details', async () => {
    const msg = { content: Buffer.from('test-url') };
    channel.consume.mockImplementationOnce((queue, onMessage) => onMessage(msg));
    scraper.scrapePropertyDetails.mockRejectedValueOnce(new Error('Scraping error'));
    await main();
    expect(channel.consume).toHaveBeenCalledWith('propertyUrlsQueue', expect.any(Function), { noAck: false });
    expect(scraper.scrapePropertyDetails).toHaveBeenCalledWith('test-url', scraper.detailsXPaths);
    expect(console.error).toHaveBeenCalledWith('Error in main:', new Error('Scraping error'));
  });

});
