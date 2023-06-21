const dotenv = require("dotenv");
dotenv.config();
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
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
  }
};
