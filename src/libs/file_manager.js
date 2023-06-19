const fs = require('fs');

class FileManager {
    static appendToFile(filename, content) {
        fs.appendFile(filename, JSON.stringify(content), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
}

module.exports = FileManager;
