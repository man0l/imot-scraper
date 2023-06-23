const dotenv = require("dotenv");
const path = require("path");
dotenv.config({
  path: path.join(__dirname, "../..", ".env")
});

module.exports = {
  rabbitmq: {
    host: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABITMQ_PASSWORD,
    queue_property_types: process.env.RABBITMQ_QUEUE_PROPERTY_TYPES,
    queue_property_listings: process.env.RABBITMQ_QUEUE_PROPERTY_LISTINGS
  },
  database: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
  },
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    userDataDir: process.env.PUPPETEER_USER_DATA_DIR,
    profileName: process.env.PUPPETEER_PROFILE_NAME,
    waitTimeout: process.env.PUPPETEER_WAIT_TIMEOUT
  }
};
