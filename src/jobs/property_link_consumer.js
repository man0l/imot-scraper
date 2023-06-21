const puppeteer = require('puppeteer');
const path = require('path');
const AMQPWrapper = require(path.join(__dirname, '..', 'libs', 'amqp_wrapper'));

const ImotBGScraper = require(path.join(__dirname, '..', 'libs', 'imotbg_scraper'));
const config = require(path.join(__dirname, '..', 'config', 'config'));
const PropertyRepository = require(path.join(__dirname, '..', 'libs', 'PropertyRepository'));
const md5 = require('md5');

async function main() {
    
    try {
        let amqp = new AMQPWrapper(config);
        console.log('connecting to amqp');
        await amqp.connect();
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const scraper = new ImotBGScraper(browser, page);

        console.log('Waiting for property URLs...');

        amqp.consume(config.rabbitmq.queue_property_types, async (msg) => {
            if (msg !== null) {
                const url = msg.content.toString();
                const propertyDetails = await scraper.scrapePropertyDetails(url, scraper.detailsXPaths);

                if (propertyDetails && propertyDetails.length > 0) {
                   propertyDetails.url = url;
                   propertyDetails.urlKey = md5(url);
                   await PropertyRepository.createProperty(propertyDetails);                   
                }

                amqp.channel.ack(msg);
            }
        }, { noAck: false });
        

    } catch (error) {
        console.error('Error in main:', error);
    }
}

exports.main = main;