const AMQPWrapper = require('../libs/amqp_wrapper');
const config = require('../config/config');
const BrowserClass = require('../libs/browser');
const ImotBGScraper = require('../libs/imotbg_scraper');
const fs = require('fs');
const {Property} = require('../models');

const propertyTypes = {
  '1-стаен': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=1&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  '2-стаен': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=2&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  '3-стаен': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=3&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  '4-стаен': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=4&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'многостаен': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=5&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'мезонет': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=6&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'офис': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=7&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'ателие, таван': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=8&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'етаж от къща': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=9&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'къща': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=10&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'вила': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=11&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'магазин': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=12&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'склад': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=14&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5=',
  'гараж': 'https://imoti-sofia.imot.bg/pcgi/imot.cgi?act=11&f1=4&f2=1&f3=15&f4=%E3%F0%E0%E4%20%D1%EE%F4%E8%FF&f5='
};

let types = [];

for (let name in propertyTypes) {
  types.push({ name: name, link: propertyTypes[name] });
}

const EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 3; // 3 days

async function start (amqp, scraper) {
try {
  for(i in types) {
    let propertyLinks = await scraper.scrapePropertyLinks(types[i].link);
    if (propertyLinks === null || propertyLinks.length === 0) {
      return;
    }
    
    propertyLinks = [...new Set(propertyLinks)]; // deduplication

    propertyLinks.forEach(async link => {
      
      let property = await Property.findOne({ where: { url: link } });
      if (property && !didPropertyExpired(property)) {
        return;
      }
      
      let msg = JSON.stringify({propType: types[i].name, link: link});
      await amqp.sendToQueue(config.rabbitmq.queue_property_listings, msg);
      console.log(msg + ' sent to queue');
    });   
    
  }
} catch(e) {
  console.log("Error in start function: " + e.message);
}

}

let didPropertyExpired = (property) => {
  
  if (property.updatedAt > Date.now() - EXPIRATION_TIME) {
    return false;
  }

  return true;

}
 
exports.start = start;
exports.propertyTypes = propertyTypes;
