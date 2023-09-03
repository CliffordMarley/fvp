const MongoDBConnection = require("../config/dbconn.config");

module.exports = class SectionModel {
    constructor() {
        this.dbConnection = new MongoDBConnection('aip_validator');
        this.collection = null;
        this.initialize()
    }

    async initialize() {
        try {
            await this.dbConnection.connect();
            this.collection = this.dbConnection.getCollection('postLog');
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

    async InsertLog(data) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
            await this.collection.insertOne(data)
            return true;
        } catch (err) {
            throw err;
        }
    }


    
}
