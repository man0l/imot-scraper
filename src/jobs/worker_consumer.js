console.log('worker init');

const {ScraperService} = require('./property_link_consumer');

const Browser = require('../libs/browser');
const ImotBGScraper = require('../libs/imotbg_scraper');
const AMQPWrapper = require('../libs/amqp_wrapper');
const PropertyRepository = require('../libs/PropertyRepository');
const config = require('../config/config');

(async () => {
    const browser = await (new Browser()).launch();
    console.log('create consumer');
    const consumer = new ScraperService(config, new AMQPWrapper(config), new ImotBGScraper(browser), PropertyRepository);
    await consumer.start();
})();