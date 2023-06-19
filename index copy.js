const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require("openai");
let fs = require('fs');

const config = dotenv.config().parsed;
// Initialize OpenAI API with your credentials

const configuration = new Configuration({
    apiKey: config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

    const url = propertyTypes['2-стаен'];
    await page.goto(url);
    // extract all links that are property links and consist of imot.cgi into the url
    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors
            .filter(anchor => anchor.href.includes('imot.cgi?act=5'))
            .map(anchor => anchor.href);
    });

    console.log(links);
    props = []
    // ccycle through links and extract the html of the page in chunks
    for (const link of links) {
        await page.goto(link);
        const propertyDetails = await page.evaluate(() => {
            const getElementText = (element, xpath) => {
              const node = element.evaluate(xpath, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
              return node ? node.textContent.trim() : null;
            };
          
            const propertyType = getElementText(document, '//div[@class="title"]');
            const location = getElementText(document, '//div[@class="location"]');
            const price = getElementText(document, '//div[@id="cena"]');
            const pricePerSquareMeter = getElementText(document, '//span[@id="cenakv"]');
            const area = getElementText(document, '//div[contains(text(), "Площ")]/strong');
            const floor = getElementText(document, '//div[contains(text(), "Етаж")]/strong');
            const constructionType = getElementText(document, '//div[contains(text(), "Строителство")]/strong');
            const propertyFeatures = Array.from(document.querySelectorAll('table div[style*="margin-bottom"] div'))
              .map(element => element.textContent.trim());
          
            return {
              propertyType,
              location,
              price,
              pricePerSquareMeter,
              area,
              floor,
              constructionType,
              propertyFeatures,
            };
          });

          // append the property details into the file
        props.push(propertyDetails);
      
    }

    fs.appendFile('propertyDetails.txt', JSON.stringify(props), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    
  await browser.close().catch(console.error);
})();