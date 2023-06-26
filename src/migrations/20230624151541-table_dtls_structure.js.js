'use strict';
const { propertyTypes } = require('../jobs/property_type_publisher');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      location: Sequelize.STRING,
      city: Sequelize.STRING,
      district: Sequelize.STRING,
      year: Sequelize.INTEGER,
      price: Sequelize.DECIMAL,
      pricePerSquareMeter: Sequelize.DECIMAL,
      area: Sequelize.DECIMAL,
      floor: Sequelize.INTEGER,
      constructionType: Sequelize.STRING,
      propertyFeatures: Sequelize.STRING,
      description: Sequelize.STRING,
      url: Sequelize.STRING,
      urlKey: Sequelize.STRING,
      propertyTypeId: Sequelize.INTEGER, // New field for the foreign key
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await queryInterface.createTable('propertytypes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await queryInterface.addConstraint('properties', {
      fields: ['propertyTypeId'],
      type: 'foreign key',
      name: 'propertyTypeId',
      references: {
        table: 'propertytypes',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    const records = Object.keys(propertyTypes).map((propertyType) => {
      return {
        name: propertyType,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });  

    await queryInterface.bulkInsert('propertytypes', records);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('properties', 'propertyTypeId');
    await queryInterface.dropTable('properties');
    await queryInterface.dropTable('propertytypes');    
  }
};
