const AMQPWrapper = require('../src/libs/amqp_wrapper');
const ImotBGScraper = require('../src/libs/imotbg_scraper');
const Browser = require('../src/libs/browser');
const config = require('../src/config/config');
const { start } = require('../src/jobs/property_type_publisher');
jest.useFakeTimers(); // Using fake timers

let propertyTypes = {
  '1-стаен': 'mock_url_1',
  '2-стаен': 'mock_url_2',
  '3-стаен': 'mock_url_3',
  '4-стаен': 'mock_url_4',
  'многостаен': 'mock_url_5',
  'мезонет': 'mock_url_6',
  'офис': 'mock_url_7',
  'ателие, таван': 'mock_url_8',
  'етаж от къща': 'mock_url_9',
};

jest.mock('../src/libs/amqp_wrapper', () => jest.fn());
jest.mock('../src/libs/imotbg_scraper', () => {
  return jest.fn().mockImplementation(() => {
    return {scrapePropertyLinks: jest.fn()};
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
  }
}));

const mockConnect = jest.fn();
const mockConsume = jest.fn();
const mockSendToQueue = jest.fn();
const mockAck = jest.fn();
const mockClose = jest.fn();
const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
AMQPWrapper.mockImplementation(() => ({
  connect: mockConnect,
  consume: mockConsume,
  sendToQueue: mockSendToQueue,
  close: mockClose,
  channel: {
    ack: mockAck,
  }
}));

jest.mock('../src/libs/imotbg_scraper', () => {
  return jest.fn().mockImplementation(() => {
    return {
        scrapePropertyLinks: jest.fn(),
        scrapePropertyDetails: jest.fn()
    };
  });
});

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
let scraper = new ImotBGScraper(browserInstance);

describe('start', () => {
  let consoleErrorSpy;

  beforeEach(() => {
     // Create a spy for console.error
     consoleErrorSpy = jest.spyOn(console, 'error');
     consoleErrorSpy.mockImplementation(() => {});

     // Reset the mock call count before each test
     mockConnect.mockClear();
     mockConsume.mockClear();
     mockSendToQueue.mockClear();
     mockAck.mockClear();
     scraper.scrapePropertyLinks.mockImplementation(url => {
      // Here, I'm using an object to map URLs to return values. 
      // You could adjust this object to fit your exact use case.
      const urlToLinksMap = {};
      Object.entries(propertyTypes).forEach(([key, value]) => {
        urlToLinksMap[value] = [
          `mock_link_${key}_1`,
          `mock_link_${key}_2`,
          `mock_link_${key}_3`,
        ];
      });
      return Promise.resolve(urlToLinksMap[url]);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore console.error to its original form
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
    scraper.scrapePropertyLinks.mockRestore();
    mockConnect.mockRestore();
  });

  it('should connect to AMQP and send property links to the queue', async () => {
    const amqp = new AMQPWrapper(); // Create AMQPWrapper instance here
    await browserInstance.launch(); 
    start.propertyTypes = propertyTypes;
    await start(amqp, scraper);
  
    expect(mockConnect).toHaveBeenCalledTimes(1);
  
    Object.values(propertyTypes).forEach(url => {
      expect(scraper.scrapePropertyLinks).toHaveBeenCalledWith(url);
    });
  });
  

  it('should handle errors when connecting to AMQP', async () => {
    const error = new Error('AMQP connection error');
    mockConnect.mockImplementationOnce(() => Promise.reject(error));
    
    const amqp = new AMQPWrapper(); // Create AMQPWrapper instance here
    await browserInstance.launch(); 
    start.propertyTypes = propertyTypes;
  
    await start(amqp, scraper);
  
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error in main:', error);
  });
  
});
