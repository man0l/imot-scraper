const { Property, PropertyType } = require('../models');

class PropertyRepository {
  async createProperty(property) {
    if (!property) {
      throw new Error('Property is required');
    }
    const propertyType = await PropertyType.findOrCreate({
      where: { name: property.propertyType },
    });
    
    const createdProperty = await Property.findOrCreate({
      ...property,
      propertyTypeId: propertyType[0].id
    });

    return createdProperty;
  }
}

module.exports = new PropertyRepository();
