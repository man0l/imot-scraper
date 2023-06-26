const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Property = sequelize.define('Property', {
      location: DataTypes.STRING,
      city: DataTypes.STRING,
      district: DataTypes.STRING,
      year: DataTypes.INTEGER,
      price: DataTypes.DECIMAL,
      pricePerSquareMeter: DataTypes.DECIMAL,
      area: DataTypes.DECIMAL,
      floor: DataTypes.INTEGER,
      constructionType: DataTypes.STRING,
      propertyFeatures: DataTypes.STRING,
      description: DataTypes.STRING, // New field for the description
      url: DataTypes.STRING,
      urlKey: DataTypes.STRING,
      propertyTypeId: DataTypes.INTEGER, // New field for the foreign key
    }, {
      tableName: 'properties'
    });
  
    Property.associate = (models) => {
      Property.belongsTo(models.PropertyType, {
        foreignKey: 'propertyTypeId',
        onDelete: 'CASCADE',
      });
    };
  
    return Property;
  };
  