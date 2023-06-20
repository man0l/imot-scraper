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
      evaluate: jest.fn(),
    };
    browser = {
      newPage: jest.fn().mockResolvedValue(page),
    };
    puppeteer.launch.mockResolvedValue(browser);
    scraper = new ImotBGScraper(browser, page);
    errorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorMock.mockRestore();
  });

  it('should scrape property links correctly', async () => {
    const url = 'https://test.com';
    const mockLinks = ['link1', 'link2'];
    page.evaluate.mockResolvedValue(mockLinks);
    const result = await scraper.scrapePropertyLinks(url);
    expect(page.goto).toHaveBeenCalledWith(url);
    expect(page.evaluate).toHaveBeenCalled();
    expect(result).toEqual(mockLinks);
  });

  it('should scrape property details correctly', async () => {
    const url = 'https://test.com';
    const mockDetails = { propertyType: 'testType', location: 'testLocation' };
    page.evaluate.mockResolvedValue(mockDetails);
    const result = await scraper.scrapePropertyDetails(url, scraper.detailsXPaths);
    expect(page.goto).toHaveBeenCalledWith(url);
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(Function), scraper.detailsXPaths);
    expect(result).toEqual(mockDetails);
  });

  it('should return null when scrapePropertyLinks encounters an error', async () => {
    const url = 'https://test.com';
    page.evaluate.mockImplementation(() => {
      throw new Error('Test error');
    });
    const result = await scraper.scrapePropertyLinks(url);
    expect(result).toBeNull();
  });

  it('should return null when scrapePropertyDetails encounters an error', async () => {
    const url = 'https://test.com';
    page.evaluate.mockImplementation(() => {
      throw new Error('Test error');
    });
    const result = await scraper.scrapePropertyDetails(url, scraper.detailsXPaths);
    expect(result).toBeNull();
  });

  it('should handle no property links found', async () => {
    const url = 'https://test.com';
    page.evaluate.mockResolvedValue([]);
    const result = await scraper.scrapePropertyLinks(url);
    expect(page.goto).toHaveBeenCalledWith(url);
    expect(page.evaluate).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should handle no property details found', async () => {
    const url = 'https://test.com';
    page.evaluate.mockResolvedValue({});
    const result = await scraper.scrapePropertyDetails(url, scraper.detailsXPaths);
    expect(page.goto).toHaveBeenCalledWith(url);
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(Function), scraper.detailsXPaths);
    expect(result).toEqual({});
  });

});
