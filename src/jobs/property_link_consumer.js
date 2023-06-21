const path = require('path');
const Browser = require(path.join(__dirname, '..', 'libs', 'browser'));
const AMQPWrapper = require(path.join(__dirname, '..', 'libs', 'amqp_wrapper'));
const ImotBGScraper = require(path.join(__dirname, '..', 'libs', 'imotbg_scraper'));
const PropertyRepository = require(path.join(__dirname, '..', 'libs', 'PropertyRepository'));
const config = require(path.join(__dirname, '..', 'config', 'config'));
const md5 = require('md5');

class ScraperService {
    constructor(config, amqp, browser, scraper, propertyRepository) {
        this.config = config;
        this.amqp = amqp;
        this.browser = browser;
        this.scraper = scraper;
        this.propertyRepository = propertyRepository;
    }

    async connectToAmqp() {
        console.log('connecting to amqp');
        await this.amqp.connect();
    }

    async launchBrowser() {
        await this.browser.launch();
        this.page = await this.browser.getPage();
    }

    async handleMessage(msg) {
        if (msg !== null) {
            const url = msg.content.toString();
            const propertyDetails = await this.scraper.scrapePropertyDetails(url, this.scraper.detailsXPaths);

            if (propertyDetails && propertyDetails.length > 0) {
                propertyDetails.url = url;
                propertyDetails.urlKey = md5(url);
                await this.propertyRepository.createProperty(propertyDetails);
            }

            this.amqp.channel.ack(msg);
        }
    }

    async consumeMessages() {
        console.log('Waiting for property URLs...');
        this.amqp.consume(this.config.rabbitmq.queue_property_listings, this.handleMessage.bind(this), { noAck: false });
    }

    async start() {
        try {
            await this.connectToAmqp();
            await this.launchBrowser();
            await this.consumeMessages();
        } catch (error) {
            console.error('Error in main:', error);
        }
    }
}

exports.main = new ScraperService(config, new AMQPWrapper(config), new Browser(), new ImotBGScraper(), PropertyRepository);
exports.start = exports.main.start.bind(exports.main);