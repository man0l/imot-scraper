const {main} = require('./main');
const amqpWrapper = new AMQPWrapper(config);
const browser = new Browser();
await browser.launch();
const page = await browser.getPage();
const scraper = new ImotBGScraper(browser, page);

(async () => {
    await main(amqpWrapper, scraper);
});