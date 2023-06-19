// imotbg_scraper.test.js
const puppeteer = require('puppeteer');
const ImotBGScraper = require('../src/libs/imotbg_scraper');

jest.mock('puppeteer');

describe('ImotBGScraper', () => {
  let browser;
  let page;
  let scraper;

  beforeEach(() => {
    page = {
      goto: jest.fn(),
      $eval: jest.fn(),
      waitForNavigation: jest.fn(),
      close: jest.fn(),
    };
    browser = {
      newPage: jest.fn().mockResolvedValue(page),
      close: jest.fn(),
    };
    puppeteer.launch.mockResolvedValue(browser);
    scraper = new ImotBGScraper(browser, page);
  });

  it('should navigate to the correct URL', async () => {
    const url = 'https://test.com';
    await scraper.navigate(url);
    expect(page.goto).toHaveBeenCalledWith(url);
    expect(page.waitForNavigation).toHaveBeenCalled();
  });

  it('should scrape data correctly', async () => {
    const url = 'https://test.com';
    const xpath = '//div[@class="data"]';
    const data = 'Test Data';
    page.$eval.mockResolvedValue(data);
    const result = await scraper.scrapeData(url, xpath);
    expect(page.goto).toHaveBeenCalledWith(url);
    expect(page.$eval).toHaveBeenCalledWith(xpath, expect.any(Function));
    expect(result).toEqual(data);
  });

  it('should handle errors in navigation', async () => {
    const url = 'https://test.com';
    page.goto.mockRejectedValue(new Error('Test Error'));
    await expect(scraper.navigate(url)).rejects.toThrow('Test Error');
  });

  it('should handle errors in scraping', async () => {
    const url = 'https://test.com';
    const xpath = '//div[@class="data"]';
    page.$eval.mockRejectedValue(new Error('Test Error'));
    await expect(scraper.scrapeData(url, xpath)).rejects.toThrow('Test Error');
  });

  // Add more tests...
});
