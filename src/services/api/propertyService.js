import { toast } from "react-toastify";

// Initialize ApperClient for database operations
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Helper function to transform database record to UI format
const transformPropertyFromDB = (dbRecord) => {
  return {
    Id: dbRecord.Id,
    title: dbRecord.title_c || '',
    price: dbRecord.price_c || 0,
    type: dbRecord.type_c || '',
    bedrooms: dbRecord.bedrooms_c || 0,
    bathrooms: dbRecord.bathrooms_c || 0,
    squareFeet: dbRecord.square_feet_c || 0,
    address: {
      street: dbRecord.address_street_c || '',
      city: dbRecord.address_city_c || '',
      state: dbRecord.address_state_c || '',
      zipCode: dbRecord.address_zip_code_c || ''
    },
    images: dbRecord.images_c ? dbRecord.images_c.split('\n').filter(img => img.trim()) : [],
    description: dbRecord.description_c || '',
    features: dbRecord.features_c ? dbRecord.features_c.split(',').map(f => f.trim()) : [],
    yearBuilt: dbRecord.year_built_c || 0,
    listingDate: dbRecord.listing_date_c || new Date().toISOString(),
    coordinates: {
      lat: dbRecord.coordinates_lat_c || 0,
      lng: dbRecord.coordinates_lng_c || 0
    }
  };
};

// Helper function to transform UI data to database format
const transformPropertyToDB = (uiData) => {
  return {
    title_c: uiData.title,
    price_c: uiData.price,
    type_c: uiData.type,
    bedrooms_c: uiData.bedrooms,
    bathrooms_c: uiData.bathrooms,
    square_feet_c: uiData.squareFeet,
    address_street_c: uiData.address?.street,
    address_city_c: uiData.address?.city,
    address_state_c: uiData.address?.state,
    address_zip_code_c: uiData.address?.zipCode,
    images_c: Array.isArray(uiData.images) ? uiData.images.join('\n') : uiData.images,
    description_c: uiData.description,
    features_c: Array.isArray(uiData.features) ? uiData.features.join(',') : uiData.features,
    year_built_c: uiData.yearBuilt,
    listing_date_c: uiData.listingDate,
    coordinates_lat_c: uiData.coordinates?.lat,
    coordinates_lng_c: uiData.coordinates?.lng
  };
};

export const propertyService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "title_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "bedrooms_c" } },
          { field: { Name: "bathrooms_c" } },
          { field: { Name: "square_feet_c" } },
          { field: { Name: "address_street_c" } },
          { field: { Name: "address_city_c" } },
          { field: { Name: "address_state_c" } },
          { field: { Name: "address_zip_code_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "features_c" } },
          { field: { Name: "year_built_c" } },
          { field: { Name: "listing_date_c" } },
          { field: { Name: "coordinates_lat_c" } },
          { field: { Name: "coordinates_lng_c" } }
        ],
        orderBy: [
          { fieldName: "listing_date_c", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords("property_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data ? response.data.map(transformPropertyFromDB) : [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching properties:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error fetching properties:", error.message);
        toast.error("Failed to load properties");
      }
      return [];
    }
  },

  async getById(Id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "title_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "bedrooms_c" } },
          { field: { Name: "bathrooms_c" } },
          { field: { Name: "square_feet_c" } },
          { field: { Name: "address_street_c" } },
          { field: { Name: "address_city_c" } },
          { field: { Name: "address_state_c" } },
          { field: { Name: "address_zip_code_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "features_c" } },
          { field: { Name: "year_built_c" } },
          { field: { Name: "listing_date_c" } },
          { field: { Name: "coordinates_lat_c" } },
          { field: { Name: "coordinates_lng_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById("property_c", parseInt(Id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data ? transformPropertyFromDB(response.data) : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching property with Id ${Id}:`, error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(`Error fetching property with Id ${Id}:`, error.message);
        toast.error("Failed to load property");
      }
      return null;
    }
  },

  async create(propertyData) {
    try {
      const apperClient = getApperClient();
      const dbData = transformPropertyToDB(propertyData);
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord("property_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("Property created successfully");
          return transformPropertyFromDB(successfulRecords[0].data);
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating property:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error creating property:", error.message);
        toast.error("Failed to create property");
      }
      return null;
    }
  },

  async update(Id, propertyData) {
    try {
      const apperClient = getApperClient();
      const dbData = transformPropertyToDB(propertyData);
      
      const params = {
        records: [{ Id: parseInt(Id), ...dbData }]
      };
      
      const response = await apperClient.updateRecord("property_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("Property updated successfully");
          return transformPropertyFromDB(successfulUpdates[0].data);
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating property:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error updating property:", error.message);
        toast.error("Failed to update property");
      }
      return null;
    }
  },

  async delete(Id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(Id)]
      };
      
      const response = await apperClient.deleteRecord("property_c", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success("Property deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting property:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error deleting property:", error.message);
        toast.error("Failed to delete property");
      }
      return false;
    }
  }
};