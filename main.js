const puppeteer = require('puppeteer');
const AMQPWrapper = require('./src/libs/amqp_wrapper');
const ImotBGScraper = require('./src/libs/imotbg_scraper');
const FileManager = require('./src/libs/file_manager');
const config = require('./src/config/config');

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
                const propertyLinks = await scraper.scrapePropertyLinks(url);

                if (propertyLinks && propertyLinks.length > 0) {
                    propertyLinks.forEach(async (propertyLink) => {
                        await amqp.sendToQueue(config.rabbitmq.queue_property_listings, propertyLink);
                    });
                }

                amqp.channel.ack(msg);
            }
        }, { noAck: false });
        

    } catch (error) {
        console.error('Error in main:', error);
    }
}

exports.main = main;