const path = require('path');
const Browser = require(path.join(__dirname, '..', 'libs', 'browser'));
const AMQPWrapper = require(path.join(__dirname, '..', 'libs', 'amqp_wrapper'));
const ImotBGScraper = require(path.join(__dirname, '..', 'libs', 'imotbg_scraper'));
const PropertyRepository = require(path.join(__dirname, '..', 'libs', 'PropertyRepository'));
const config = require(path.join(__dirname, '..', 'config', 'config'));
const md5 = require('md5');
const {propertyTypes} = require('./property_type_publisher');

class ScraperService {
    constructor(config, amqp, scraper, propertyRepository) {
        this.config = config;
        this.amqp = amqp;
        this.scraper = scraper;
        this.propertyRepository = propertyRepository;
    }

    async connectToAmqp() {
        console.log('connecting to amqp');
        await this.amqp.connect();
    }

    async handleMessage(msg) {
        if (!msg) {
            return;
        }

        try {
            const jsonMsg = JSON.parse(msg.content.toString());        
            console.log(jsonMsg.link);
            const propertyDetails = await this.scraper.scrapePropertyDetails(jsonMsg.link, this.scraper.detailsXPaths);

            if (propertyDetails && Object.values(propertyDetails).length > 0) {
                propertyDetails.url = jsonMsg.link;
                propertyDetails.urlKey = md5(jsonMsg.link);
                console.log(propertyDetails);
                await this.propertyRepository.createProperty(propertyDetails, jsonMsg.propType);
            }

            this.amqp.channel.ack(msg);
        } catch (error) {
            console.error('Error parsing message:', error);
            this.amqp.channel.ack(msg);
            return;
        }
    }
    

    async consumeMessages() {
        console.log('Waiting for property URLs...');
        this.amqp.consume(this.config.rabbitmq.queue_property_listings, await this.handleMessage.bind(this), { noAck: false });
    }

    async start() {
        try {
            await this.connectToAmqp();
            await this.consumeMessages();
        } catch (error) {
            console.error('Error in main:', error);
        }
    }
}

//exports.main = new ScraperService(config, new AMQPWrapper(config), new ImotBGScraper(await (new Browser()).launch()), PropertyRepository);
//exports.start = exports.main.start.bind(exports.main);
exports.ScraperService = ScraperService;