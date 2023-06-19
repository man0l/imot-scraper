const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
let fs = require('fs');

class Config {
    constructor() {
        this.config = dotenv.config().parsed;
    }
}

class Scraper {
    constructor(browser, page) {
        this.browser = browser;
        this.page = page;
    }

    async scrapePropertyDetails(url, detailsXPaths) {
        try {
            await this.page.goto(url);
            return await this.page.evaluate((xpaths) => {
                const getElementText = (element, xpath) => {
                    const node = element.evaluate(xpath, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    return node ? node.textContent.trim() : null;
                };
                
                let propertyDetails = {};
                for (let detail in xpaths) {
                    propertyDetails[detail] = getElementText(document, xpaths[detail]);
                }

                return propertyDetails;
            }, detailsXPaths);
        } catch (error) {
            console.error(`Failed to scrape data from ${url}: ${error}`);
            return null;
        }
    }
}

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
        };
    }

    async scrapePropertyLinks(url) {
        try {
            await this.page.goto(url);
            return await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors
                    .filter(anchor => anchor.href.includes('imot.cgi?act=5'))
                    .map(anchor => anchor.href);
            });
        } catch (error) {
            console.error(`Failed to scrape data from ${url}: ${error}`);
            return null;
        }
    }
}

class FileManager {
    static appendToFile(filename, content) {
        fs.appendFile(filename, JSON.stringify(content), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
}

(async () => {
    const config = new Config();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const scraper = new ImotBGScraper(browser, page);

    const propertyTypes = {
      '1-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=1&f4=&f5=',
      '2-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=2&f4=&f5=',
      '3-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=3&f4=&f5=',
      '4-стаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=4&f4=&f5=',
      'многостаен': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=5&f4=&f5=',
      'мезонет': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=6&f4=&f5=',
      'офис': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=7&f4=&f5=',
      'ателие, таван': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=8&f4=&f5=',
      'етаж от къща': 'https://www.imot.bg/pcgi/imot.cgi?act=11&f1=1&f2=1&f3=9&f4=&f5=',
    };
    
    const url = propertyTypes['2-стаен'];
    const links = await scraper.scrapePropertyLinks(url);

    let props = []
    for (const link of links) {
        const propertyDetails = await scraper.scrapePropertyDetails(link, scraper.detailsXPaths);
        if (propertyDetails) {
            props.push(propertyDetails);
        }
    }

    FileManager.appendToFile('propertyDetails.txt', props);
    
    await browser.close().catch(console.error);
})();
