const path = require('path');
const Browser = require(path.join(__dirname, '..', 'libs', 'browser'));
const ImotBGScraper = require(path.join(__dirname, '..', 'libs', 'imotbg_scraper'));

let link = 'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=1i164699138153598';

(async () => {
    const browserInstance = new Browser();
    await browserInstance.launch();
    page = await browserInstance.getPage();
    await page.goto(link, { waitUntil: 'networkidle2' });
    const scraper = new ImotBGScraper(browserInstance, page);
    const propertyDetails = await scraper.scrapePropertyDetails(link, scraper.detailsXPaths);
    console.log(propertyDetails);
    browserInstance.close();
})();