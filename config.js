const dotenv = require('dotenv');

class Config {
    constructor() {
        this.config = dotenv.config().parsed;
    }
}

module.exports = Config;
