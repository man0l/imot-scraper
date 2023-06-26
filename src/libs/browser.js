// browser.js
const {executablePath} = require('puppeteer'); 
const puppeteer = require('puppeteer-extra') 
const pluginStealth = require('puppeteer-extra-plugin-stealth') 
const path = require('path');
const config = require('../config/config');
const fs = require('fs');

puppeteer.use(pluginStealth());

class Browser {
  constructor(workerName = null) {
    this.browser = null;
    this.page = null;
    this.cookiesPath = path.join(__dirname,"../..", config.puppeteer.userDataDir, "/cookies.json");
    this.workerName = workerName;
  }

  async launch() {
    let args = [
        '--no-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ];

      if(this.workerName) {
        args.push([
          '--user-data-dir=' + path.join(__dirname, "../..", config.puppeteer.userDataDir, '/', this.workerName),
        '--profile-directory=' + config.puppeteer.profileName,
        ]);
      }

    this.browser = await puppeteer.launch({
      executablePath: executablePath(),
      args: args,
      ignoreHTTPSErrors: true,
      dumpio: false,
      headless: 'new',
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

    if (this.page) {
      return this.page;
    }

    let page = await this.browser.newPage();
    await page.setExtraHTTPHeaders({ 
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', 
      'upgrade-insecure-requests': '1', 
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
      'accept-encoding': 'gzip, deflate, br', 
      'accept-language': 'en-US,en;q=0.9,en;q=0.8' 
    });   
    
    let filetypes = [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.css',
      '.woff',
      '.woff2',
      '.ttf',
      '.svg',
      '.ico',
      '.js',
      '.json',
      '.zip',
    ];

    let hostsToBlock = [
      // tracking
      'google-analytics.com',
      'googletagmanager.com',
      'googletagservices.com',
      'doubleclick.net',
      'googlesyndication.com',
      'adservice.google.com',
      'adservice.google.bg',
      
      // facebook tracking
      'facebook.com',
      'facebook.net',
      'fbcdn.net',
      'connect.facebook.net',
      'connect.facebook.com',
      'staticxx.facebook.com',
      'staticxx.facebook.net',
      'graph.facebook.com',
      'pixel.facebook.com',
      'web.facebook.com',
      'm.facebook.com',
      'upload.facebook.com',
      'external.xx.fbcdn.net',
      'external.xx.fbcdn.com',
      'scontent.xx.fbcdn.net',
      'scontent.xx.fbcdn.com',
      'scontent.fsof3-1.fna.fbcdn.net',
      'scontent.fsof3-1.fna.fbcdn.com',
      'scontent.fsof3-2.fna.fbcdn.net',
      'scontent.fsof3-2.fna.fbcdn.com',
      'scontent.fsof3-3.fna.fbcdn.net',
      // content
      'gstatic.com',
      // other
      'creativecdn.com',
      'gemius.pl',
      'wtg-ads.com',
    ];
    // Limit requests 
    await page.setRequestInterception(true); 
    page.on('request', async (request) => {       

      if (filetypes.some(filetype => request.url().endsWith(filetype))) {
        await request.abort();
      } else if (hostsToBlock.some(host => request.url().includes(host))) {
        await request.abort();
      } else {
        await request.continue();
      }
    }); 

    page.on('load', async () => await this.setCookies(page));

    if (
        fs.existsSync(this.cookiesPath) && 
        Object.keys(this.readCookies()).length > 0
      ) {
      await page.setCookie(...this.readCookies());
    }
    
    this.page = page;
    return new Promise(resolve => resolve(this.page));
  }

  readCookies() {
    const cookies = fs.readFileSync(this.cookiesPath, 'utf8');
    return JSON.parse(cookies);
  }

  async setCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
  }

  close() {
    if (!this.browser) {
      throw new Error('Browser is not launched');
    }

    return this.browser.close();
  }
}

module.exports = Browser;
