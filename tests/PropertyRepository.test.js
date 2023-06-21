const { Property, PropertyType } = require('../src/models');
const PropertyRepository = require('../src/libs/PropertyRepository');
const { mock } = require('jest-mock-extended');

// Create a mock property and property type
const mockProperty = {
  location: 'Location',
  price: '100',
  propertyType: 'Type',
};

const mockPropertyType = {
  id: 1,
  name: 'Type',
};

// Mock models
jest.mock('../src/models', () => {
  return {
    Property: {
      findOrCreate: jest.fn(), // Mock the findOrCreate method
    },
    PropertyType: {
      findOrCreate: jest.fn(), // Mock the findOrCreate method
    },
  };
});

// Test suite for PropertyRepository
describe('PropertyRepository', () => {
  // Clear all mock function calls before each test
  beforeEach(() => {
    Property.findOrCreate.mockClear();
    PropertyType.findOrCreate.mockClear();
  });

  test('createProperty creates a property and returns it', async () => {
    // Set up mock return values for findOrCreate calls
    PropertyType.findOrCreate.mockResolvedValue([mockPropertyType, true]);
    Property.findOrCreate.mockResolvedValue(mockProperty);

    // Call createProperty
    const result = await PropertyRepository.createProperty(mockProperty);

    // Assert that the mock functions were called with correct arguments
    expect(PropertyType.findOrCreate).toHaveBeenCalledWith({ where: { name: mockProperty.propertyType } });
    expect(Property.findOrCreate).toHaveBeenCalledWith({
      ...mockProperty,
      propertyTypeId: mockPropertyType.id
    });

    // Assert that the result is the created property
    expect(result).toEqual(mockProperty);
  });

  test('createProperty throws an error when called without a property', async () => {
    await expect(PropertyRepository.createProperty()).rejects.toThrow('Property is required');
  });

  test('createProperty handles the case where PropertyType.findOrCreate rejects', async () => {
    PropertyType.findOrCreate.mockRejectedValue(new Error('Test error'));
    await expect(PropertyRepository.createProperty(mockProperty)).rejects.toThrow('Test error');
  });

  test('createProperty handles the case where Property.findOrCreate rejects', async () => {
    Property.findOrCreate.mockRejectedValue(new Error('Test error'));
    await expect(PropertyRepository.createProperty(mockProperty)).rejects.toThrow('Test error');
  });
  
  test('createProperty does not call Property.findOrCreate when PropertyType.findOrCreate fails', async () => {
    PropertyType.findOrCreate.mockRejectedValue(new Error('Test error'));
    try {
      await PropertyRepository.createProperty(mockProperty);
    } catch(e) {
      expect(Property.findOrCreate).not.toHaveBeenCalled();
    }
  });
    
});
