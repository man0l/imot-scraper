const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  rabbitmq: {
    host: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABITMQ_PASSWORD
  }
};
