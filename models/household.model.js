const MongoDBConnection = require("../config/dbconn.config");

module.exports = class HouseholdModel {
    constructor() {
        this.dbConnection = MongoDBConnection
        this.collection = null;
        this.initialize()
    }

    async initialize() {
        try {
            await this.dbConnection.connect();
            this.collection = this.dbConnection.getCollection('household');
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
            const documents = await this.collection.find(filter).toArray();
            return documents;
        } catch (err) {
            throw err;
        }
    }

    async ReadWithPagination (filter = null, offset, limit) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
            const documents = await this.collection.find(filter).skip(offset).limit(limit).toArray();
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
