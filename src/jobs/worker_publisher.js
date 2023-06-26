const {start} = require('./property_type_publisher');
const AMQPWrapper = require('../libs/amqp_wrapper');
const config = require('../config/config');
const BrowserClass = require('../libs/browser');
const ImotBGScraper = require('../libs/imotbg_scraper');

(async () => {
    let amqp = new AMQPWrapper(config);
    await amqp.connect();
    
    let browserInstance = new BrowserClass();
    await browserInstance.launch();
    const scraper = new ImotBGScraper(browserInstance);
    await start(amqp, scraper);
})();