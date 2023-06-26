const path = require('path');
const { Sequelize } = require('sequelize');
const { database } = require('../config/config');

const sequelize = new Sequelize(database.database, database.user, database.password, {
  host: database.host,
  dialect: 'mysql'
});

const modelDefiners = [
  require('./Property'), // import the Property model
  require('./PropertyType'), // import the PropertyType model
];

let Property = require('./Property')(sequelize, Sequelize.DataTypes);
let PropertyType = require('./PropertyType')(sequelize, Sequelize.DataTypes);

module.exports.Property = Property;
module.exports.PropertyType = PropertyType;
module.exports.sequelize = sequelize;