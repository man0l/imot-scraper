const AMQPWrapper = require('../libs/amqp_wrapper');
const config = require('../config/config');
const BrowserClass = require('../libs/browser');
const ImotBGScraper = require('../libs/imotbg_scraper');

const propertyTypes = {
  '1-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=1&f4=&f5=',
  '2-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=2&f4=&f5=',
  '3-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=3&f4=&f5=',
  '4-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=4&f4=&f5=',
  'многостаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=5&f4=&f5=',
  'мезонет': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=6&f4=&f5=',
  'офис': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=7&f4=&f5=',
  'ателие, таван': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=8&f4=&f5=',
  'етаж от къща': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=9&f4=&f5=',
};

async function start() {
    try {
      let amqp = new AMQPWrapper(config);
      await amqp.connect();
      
      let browserInstance = new BrowserClass();
      await browserInstance.launch();
      const scraper = new ImotBGScraper(browserInstance);
  
      const scrapeAndSendPromises = Object.values(propertyTypes).map(async url => {
        const propertyLinks = await scraper.scrapePropertyLinks(url);
        if (propertyLinks === null) {
          return;
        }
        const sendToQueuePromises = propertyLinks.map(link => {
          return amqp.sendToQueue(config.rabbitmq.queue_property_listings, link);
        });
  
        await Promise.all(sendToQueuePromises);
      });
  
      await Promise.all(scrapeAndSendPromises);
  
      setTimeout(() => {
        amqp.close();
        process.exit(0);
      }, 500);
    } catch (error) {
      console.error('Error in main:', error);
    }
  }
  
exports.start = start;
exports.propertyTypes = propertyTypes;
