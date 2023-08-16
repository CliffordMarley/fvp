const MongoDBConnection = require("../config/dbconn.config");

module.exports = class HouseholdModel {
    constructor() {
        this.dbConnection = new MongoDBConnection('aip_validator');
        this.collection = null;
        this.initialize()
    }

    async initialize() {
        try {
            await this.dbConnection.connect();
            this.collection = this.dbConnection.getCollection('constituency');
        } catch (err) {
            throw err;
        }
    }

    async close() {
        try {
            await this.dbConnection.close();
        } catch (err) {
            throw err;
        }
    }
   


    async Read(filter = null) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }

            // The 'filter' parameter can be used to pass query criteria to MongoDB
            // For example, if filter = { city: 'New York' }, it will fetch households in New York
            const documents = await this.collection.find(filter).toArray();
            return documents;
        } catch (err) {
            throw err;
        }
    }


    async updateByNationalID(National_ID, data) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
    
            const filter = { National_ID };
            
            // Exclude _id from the update data
            const updateData = { $set: { ...data } };
            delete updateData.$set._id; // Make sure _id is not included
    
            const options = { returnOriginal: false };
    
            const result = await this.collection.findOneAndUpdate(filter, updateData, options);
            return result.value;
        } catch (err) {
            throw err;
        }
    }
    


}
