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


for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize, Sequelize.DataTypes);
}

module.exports = sequelize;
