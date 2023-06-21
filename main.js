const puppeteer = require('puppeteer');

const ImotBGScraper = require('./src/libs/imotbg_scraper');

const config = require('./src/config/config');

async function main(amqp, scraper) {
    
    try {

        console.log('connecting to amqp');
        await amqp.connect();
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
          });

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