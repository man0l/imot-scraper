const Scraper = require('./scraper');

class ImotBGScraper extends Scraper {
    constructor(browser) {
        super(browser);
        this.detailsXPaths = {
            propertyType: '//div[@class="title"]',
            location: '//div[@class="location"]',
            price: '//div[@id="cena"]',
            pricePerSquareMeter: '//span[@id="cenakv"]',
            area: '//div[contains(text(), "Площ")]/strong',
            floor: '//div[contains(text(), "Етаж")]/strong',
            constructionType: '//div[contains(text(), "Строителство")]/strong',
            //propertyFeatures: '//table div[style*="margin-bottom"] div'
            propertyFeatures: '/html/body/div[2]/table/tbody/tr[1]/td[1]/form/table[3]',
            description: '//div[@id="description_div"]'
        };
    }
}

module.exports = ImotBGScraper;
