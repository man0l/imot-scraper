// main.test.js

jest.mock('../libs/amqp_wrapper');
jest.mock('../config/config');
jest.useFakeTimers(); // Using fake timers

describe('main', () => {
  let consoleErrorOriginal;
  let consoleLogOriginal;
  let processExitOriginal;
  let amqp;

  beforeAll(() => {
    consoleErrorOriginal = console.error;
    consoleLogOriginal = console.log;
    processExitOriginal = process.exit;
    console.error = jest.fn();
    console.log = jest.fn();
    process.exit = jest.fn();
    amqp = new AMQPWrapper();
  });

  afterAll(() => {
    console.error = consoleErrorOriginal;
    console.log = consoleLogOriginal;
    process.exit = processExitOriginal;
    jest.restoreAllMocks();
  });

  it('should connect to AMQP and send property types to the queue', async () => {
    const propertyTypesMock = {
      'test-property-type': 'test-url',
    };
    const main = require('../src/jobs/property_type_publisher')(propertyTypesMock); // Assuming you export the main function and allow propertyTypes to be passed as an argument

    await main();

    expect(amqp.connect).toHaveBeenCalled();
    expect(amqp.sendToQueue).toHaveBeenCalledWith(config.rabbitmq.RABBITMQ_QUEUE_PROPERTY_TYPES, 'test-url');
    expect(console.log).toHaveBeenCalledWith(`Sent 'test-url'`);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);

    jest.runAllTimers(); // Running all timers

    expect(amqp.close).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should handle errors when connecting to AMQP', async () => {
    const error = new Error('AMQP connection error');
    amqp.connect.mockRejectedValueOnce(error);
    const main = require('./main')({});

    await main();

    expect(console.error).toHaveBeenCalledWith('Error in main:', error);
  });
});
