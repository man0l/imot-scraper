const scraperService = require('../src/jobs/property_link_consumer').main;
const AMQPWrapper = require('../src/libs/amqp_wrapper');
const Browser = require('../src/libs/browser');
const ImotBGScraper = require('../src/libs/imotbg_scraper');
const PropertyRepository = require('../src/libs/PropertyRepository');

jest.mock('../src/libs/amqp_wrapper');
jest.mock('../src/libs/browser');
jest.mock('../src/libs/imotbg_scraper');
jest.mock('../src/libs/PropertyRepository');

describe('ScraperService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('connects to AMQP successfully', async () => {
        await scraperService.connectToAmqp();
        expect(AMQPWrapper.prototype.connect).toHaveBeenCalled();
    });

    test('launches browser successfully', async () => {
        Browser.prototype.getPage.mockResolvedValue('test_page');
        await scraperService.launchBrowser();
        expect(Browser.prototype.launch).toHaveBeenCalled();
        expect(Browser.prototype.getPage).toHaveBeenCalled();
    });

    test('handles message successfully', async () => {
        const msg = { content: { toString: () => 'test_url' } };
        ImotBGScraper.prototype.scrapePropertyDetails.mockResolvedValue([{test: 'data'}]);
        PropertyRepository.createProperty.mockResolvedValue(true);
        AMQPWrapper.prototype.channel = { ack: jest.fn() };

        await scraperService.handleMessage(msg);

        expect(ImotBGScraper.prototype.scrapePropertyDetails).toHaveBeenCalledWith('test_url', ImotBGScraper.prototype.detailsXPaths);
        expect(PropertyRepository.createProperty).toHaveBeenCalled();
        expect(AMQPWrapper.prototype.channel.ack).toHaveBeenCalledWith(msg);
    });

    test('consumes messages successfully', async () => {
        await scraperService.consumeMessages();
        expect(AMQPWrapper.prototype.consume).toHaveBeenCalled();
    });

    test('starts service successfully', async () => {
        const startSpy = jest.spyOn(scraperService, 'start');
        const connectSpy = jest.spyOn(scraperService, 'connectToAmqp');
        const launchSpy = jest.spyOn(scraperService, 'launchBrowser');
        const consumeSpy = jest.spyOn(scraperService, 'consumeMessages');

        await scraperService.start();
        
        expect(connectSpy).toHaveBeenCalled();
        expect(launchSpy).toHaveBeenCalled();
        expect(consumeSpy).toHaveBeenCalled();
        
        startSpy.mockRestore();
        connectSpy.mockRestore();
        launchSpy.mockRestore();
        consumeSpy.mockRestore();
    });

    test('handles error during start', async () => {
        scraperService.connectToAmqp = jest.fn(() => { throw new Error('Test error'); });

        // Mock console.error to suppress output during tests
        console.error = jest.fn();

        await scraperService.start();

        expect(console.error).toHaveBeenCalledWith('Error in main:', new Error('Test error'));
    });
});
