const path = require('path');
const Browser = require(path.join(__dirname, '..', 'libs', 'browser'));
const ImotBGScraper = require(path.join(__dirname, '..', 'libs', 'imotbg_scraper'));
const fs = require('fs');

let link = 'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=1i164699138153598';
let links = fs.readFileSync('../../links.txt', 'utf8').split('\n');

(async () => {
    const browserInstance = new Browser();
    await browserInstance.launch();
    const scraper = new ImotBGScraper(browserInstance);

    // let details = links.map(async link => {
    //     let propertyDetails = await scraper.scrapePropertyDetails(link.trim(), scraper.detailsXPaths);
    //     return propertyDetails;
    // });    

    let details = [];
    for (let i = 0; i < links.length; i++) {
        let propertyDetails = await scraper.scrapePropertyDetails(links[i].trim(), scraper.detailsXPaths);
        details.push(propertyDetails);
    }


    Promise.all(details).then(values => {
        console.log(values);
    });
    //browserInstance.close();
})();