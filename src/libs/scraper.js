const Browser = require('./browser');
const config = require('../config/config');
class Scraper {
    constructor(browser) {
        // expects an instance of a Browser
        if (!(browser instanceof Browser)) {
            throw new Error('Invalid browser instance. It shoulde be an instance of Browser');
        }

        this.browser = browser;
        this.page = null;
        console.log('browser initialized');
    }

    async getPage() {
        if (!this.page) {
            this.page = await this.browser.getPage();
        }

        return this.page;
    }

    async scrapePropertyLinks(url) {
        this.page = this.page || await this.getPage();
        await this.page.waitForTimeout((Math.floor(Math.random() * config.puppeteer.waitTimeout))) 
        try {
            await this.page.goto(url);
            return await this.page.evaluate(() => {
                let popup = document.querySelector("body > div.fc-consent-root > div.fc-dialog-container > div.fc-dialog.fc-choice-dialog > div.fc-footer-buttons-container > div.fc-footer-buttons > button.fc-button.fc-cta-consent.fc-primary-button");
                if (popup) {
                    popup.click();
                }
                const anchors = Array.from(document.querySelectorAll('a'));
                let filtered = 
                anchors
                    .filter(anchor => anchor.href.includes('imot.cgi?act=5'))
                    .map(anchor => anchor.href);
                return [...new Set(filtered)]
            });
        } catch (error) {
            console.error(`Failed to scrape data from ${url}: ${error}`);
            return null;
        }
    }

    async scrapePropertyDetails(url, detailsXPaths) {
        this.page = await this.getPage();
        await this.page.waitForTimeout((Math.floor(Math.random() * config.puppeteer.waitTimeout))) 

        try {
            console.log('scraping property details');
            await this.page.goto(url);
            let results = await this.page.evaluate((xpaths) => {
                let popup = document.querySelector("body > div.fc-consent-root > div.fc-dialog-container > div.fc-dialog.fc-choice-dialog > div.fc-footer-buttons-container > div.fc-footer-buttons > button.fc-button.fc-cta-consent.fc-primary-button");
                if (popup) {
                    popup.click();
                }
                const getElementText = (element, xpath) => {
                    const node = element.evaluate(xpath, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    return node ? node.textContent.trim() : null;
                };
          
                let propertyDetails = {};
                for (const detail in xpaths) {
                    propertyDetails[detail] = getElementText(document, xpaths[detail]);
                }

                return propertyDetails;
            }, detailsXPaths);
            //await this.page.close();
            return results;
        } catch (error) {
            console.error(`Failed to scrape data from ${url}: ${error}`);
            return null;
        }
    }
}

module.exports = Scraper;
