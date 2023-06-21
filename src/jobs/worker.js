const path = require('path');
const workerName = process.argv[2];
const fs = require('fs');
const workerFilePath = path.join(__dirname, `${workerName}.js`);

if (!fs.existsSync(workerFilePath)) {
    console.log(`Worker ${workerName} does not exist`);
    process.exit(1);
}

const worker = require(workerFilePath);
worker.start();
