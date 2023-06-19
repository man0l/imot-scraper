const puppeteer = require('puppeteer');
const AMQPWrapper = require('./src/libs/amqp_wrapper');
const ImotBGScraper = require('./src/libs/imotbg_scraper');
const FileManager = require('./src/libs/file_manager');
const config = require('./src/config/config');

async function main() {
    try {
        let amqp = new AMQPWrapper(config);
        const connection = await amqp.connect();
        const channel = await connection.createChannel();

        const queue = 'propertyUrlsQueue';
        await channel.assertQueue(queue, { durable: true });

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const scraper = new ImotBGScraper(browser, page);

        console.log('Waiting for property URLs...');

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const propertyUrl = msg.content.toString();
                const propertyDetails = await scraper.scrapePropertyDetails(propertyUrl, scraper.detailsXPaths);

                if (propertyDetails) {
                    FileManager.appendToFile('propertyDetails.txt', propertyDetails);
                }

                channel.ack(msg);
            }
        }, { noAck: false });

    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();
