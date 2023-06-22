const producer = require('./property_type_publisher');

(async () => {
    await producer.start();
})();