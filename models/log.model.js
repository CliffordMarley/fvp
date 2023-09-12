const MongoDBConnection = require("../config/dbconn.config");

module.exports = class  {
    constructor() {
        this.dbConnection = new MongoDBConnection()
        this.collection = null;
        this.initialize()
    }

    async initialize() {
        try {
            await this.dbConnection.connect();
            this.collection = this.dbConnection.getCollection('post_logger');
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

    async Insert(data) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
            if(data == null || data == typeof undefined || data == []){
                return true
            }else{
                await this.collection.insertOne(data)
                return true;
            }
            
        } catch (err) {
            console.log(err.message)
            throw err;
        }
    }


    
}
