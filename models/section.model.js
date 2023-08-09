const MongoDBConnection = require("../config/dbconn.config");

module.exports = class HouseholdModel {
    constructor() {
        this.dbConnection = new MongoDBConnection('FPV');
        this.collection = null;
    }

    async initialize() {
        try {
            await this.dbConnection.connect();
            this.collection = this.dbConnection.getCollection('sections');
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


    
}
