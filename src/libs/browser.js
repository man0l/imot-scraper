// browser.js
const puppeteer = require('puppeteer');

class Browser {
  constructor() {
    this.browser = null;
  }

  async launch() {
    this.browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  }

  async getPage() {
    if (!this.browser) {
      throw new Error('Browser is not launched');
    }

    return await this.browser.newPage();
  }
}

module.exports = Browser;
