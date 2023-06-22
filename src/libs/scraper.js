class Scraper {
    constructor(browser) {
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

    async scrapePropertyDetails(url, detailsXPaths) {
        this.page = this.page || await this.getPage();

        try {
            await this.page.goto(url);
            return await this.page.evaluate((xpaths) => {
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
        } catch (error) {
            console.error(`Failed to scrape data from ${url}: ${error}`);
            return null;
        }
    }
}

module.exports = Scraper;
