const amqp = require('amqplib');

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

async function main() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queue = 'propertyUrlsQueue';
        await channel.assertQueue(queue, { durable: true });

        for (const propertyType in propertyTypes) {
            channel.sendToQueue(queue, Buffer.from(propertyTypes[propertyType]), { persistent: true });
            console.log(`Sent '${propertyTypes[propertyType]}'`);
        }

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();
