// browser.js
const puppeteer = require('puppeteer');

class Browser {
  constructor() {
    this.browser = null;
  }

  async launch() {
    this.browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      ignoreHTTPSErrors: true,
      dumpio: false,
      headless: true,
      defaultViewport: null,
    });    
  }

  getBrowser() {
    if (!this.browser) {
      throw new Error('Browser is not launched');
    }

    return this.browser;
  }

  async getPage() {
    if (!this.browser) {
      throw new Error('Browser is not launched');
    }

    return await this.browser.newPage();
  }
}

module.exports = Browser;
