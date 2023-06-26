const {Property, PropertyType} = require('../models');

class PropertyRepository {
  async createProperty(property, propertyTypeString) {
    if (!property) {
      throw new Error('Property is required');
    }

    if(!propertyTypeString) {
      throw new Error('Property type is required');
    }
    
    const [propertyType] = await PropertyType.findOrCreate({
      where: { name: propertyTypeString },
    });
    
    const [createdProperty, created] = await Property.findOrCreate({
      where: this.transformProperty(property, propertyType.id),
    });

    return createdProperty;
  }

  transformProperty(property, propertyTypeId) {
      let area = property.area;
      if (typeof area === 'string') {
          area = Number(area.replace(/[^0-9\.]/g, ''));
      }

      let floor = property.floor;
      if (typeof floor === 'string') {
          const floorMatches = floor.match(/(\d+)-/);
          if (floorMatches) {
              floor = Number(floorMatches[1]);
          } else {
              floor = null;
          }
      }

      let city = null;
      let district = null;
      if (property.location.includes(',')) {
        city = property.location.split(',')[0];
        district = property.location.split(',')[1];
      }

      let yearBuilt = null;
      if (property.constructionType.includes('г.')) {
        yearBuilt = property.constructionType.split('г.')[1];
      }

      return {
          location: property.location,
          city: city,
          district: district,
          price: Number(property.price.replace(/[^0-9\.]/g, '')),
          pricePerSquareMeter: Number(property.pricePerSquareMeter.split(' ')[0].replace(/[^\d.]/g, '')),
          area: area,
          floor: floor,
          constructionType: property.constructionType,
          description: property.description,
          url: property.url,
          urlKey: property.urlKey,
          propertyTypeId: propertyTypeId
      }
  }
}

module.exports = new PropertyRepository();
