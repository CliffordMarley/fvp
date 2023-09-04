const MongoDBConnection = require("../config/dbconn.config");
const moment = require("moment")
module.exports = class HouseholdModel {
    constructor() {
        this.dbConnection = new MongoDBConnection('aip_validator');
        this.collection = null;
        this.initialize()
    }

    async initialize() {
        try {
            await this.dbConnection.connect();
            this.collection = this.dbConnection.getCollection('events');
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

    async Log(username, event, extra = null){
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
            
            if(!username && !event) return 

            const eventlog = {username, event, timestamp:moment().format('MMMM Do YYYY, h:mm:ss a')}
            const document = await this.collection.insertOne(eventlog);
            console.log(`%s : AEDO ${username} ${event}!`, moment().utc().format())
            return document;
        } catch (err) {
            throw err;
        }
    }


    
}
