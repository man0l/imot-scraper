module.exports = (sequelize, DataTypes) => {
    const PropertyType = sequelize.define('PropertyType', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    });
  
    PropertyType.associate = (models) => {
      PropertyType.hasMany(models.Property, {
        foreignKey: 'propertyTypeId',
        as: 'properties',
      });
    };
  
    return PropertyType;
  };
  