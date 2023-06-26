const {ScraperService} = require('../src/jobs/property_link_consumer');
const AMQPWrapper = require('../src/libs/amqp_wrapper');
const Browser = require('../src/libs/browser');
const ImotBGScraper = require('../src/libs/imotbg_scraper');
const PropertyRepository = require('../src/libs/PropertyRepository');
const config = require('../src/config/config');
const propertyTypes = require('../src/jobs/property_type_publisher').propertyTypes;

jest.mock('../src/libs/amqp_wrapper', () => jest.fn());
jest.mock('../src/libs/imotbg_scraper', () => {
  return jest.fn().mockImplementation(() => {
    return {
        scrapePropertyLinks: jest.fn(),
        scrapePropertyDetails: jest.fn()
    };
  });
});
jest.mock('../src/config/config', () => ({
  rabbitmq: {
    host: 'mockHost',
    port: 'mockPort',
    user: 'mockUser',
    password: 'mockPassword',
    queue_property_types: 'mockQueue',
    queue_property_listings: 'mockQueue',
  },
    database: {
        host: 'mockHost',
        port: 'mockPort',
        user: 'mockUser',
        password: 'mockPassword',
        database: 'mockDatabase',
    },
    puppeteer: {
        executablePath: 'mockExecutablePath',
        userDataDir: 'mockUserDataDir',
        profileName: 'mockProfileName',
        waitTimeout: 'mockWaitTimeout',
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



jest.mock('../src/libs/browser', () => {
    return jest.fn().mockImplementation(() => {

        return {
            launch: jest.fn(),
            getPage: jest.fn(),
        };
    });
});

let browserInstance = new Browser();
browserInstance.launch.mockResolvedValue('test_browser');


let scraperService = new ScraperService(config, new AMQPWrapper(config), new ImotBGScraper(browserInstance), PropertyRepository);

describe('ScraperService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('connects to AMQP successfully', async () => {
        await scraperService.connectToAmqp();
        expect(mockConnect).toHaveBeenCalled();
    });

    test('handles message successfully', async () => {
        const msg = { content: { toString: () => 'test_url' } };
        await scraperService.handleMessage(msg);

        expect(mockAck).toHaveBeenCalledWith(msg);
    });

    test('consumes messages successfully', async () => {
        await scraperService.consumeMessages();
        expect(mockConsume).toHaveBeenCalled();
    });

    test('starts service successfully', async () => {
        const startSpy = jest.spyOn(scraperService, 'start');
        const connectSpy = jest.spyOn(scraperService, 'connectToAmqp');
        const consumeSpy = jest.spyOn(scraperService, 'consumeMessages');

        await scraperService.start();
        
        expect(connectSpy).toHaveBeenCalled();
        expect(consumeSpy).toHaveBeenCalled();
        
        startSpy.mockRestore();
        connectSpy.mockRestore();
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
