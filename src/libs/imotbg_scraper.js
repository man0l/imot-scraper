const Scraper = require('./scraper');

class ImotBGScraper extends Scraper {
    constructor(browser, page) {
        super(browser, page);
        this.detailsXPaths = {
            propertyType: '//div[@class="title"]',
            location: '//div[@class="location"]',
            price: '//div[@id="cena"]',
            pricePerSquareMeter: '//span[@id="cenakv"]',
            area: '//div[contains(text(), "Площ")]/strong',
            floor: '//div[contains(text(), "Етаж")]/strong',
            constructionType: '//div[contains(text(), "Строителство")]/strong',
            propertyFeatures: '//table div[style*="margin-bottom"] div'
        };
    }
}

module.exports = ImotBGScraper;
