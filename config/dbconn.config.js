const { MongoClient } = require('mongodb');

class MongoDBConnection {
  constructor(dbName) {
    this.dbName = dbName;
    this.url = 'mongodb://aip_validator:Angelsdie1997@aip-validator.agriculture.gov.mw:27017/?authMechanism=DEFAULT';
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(this.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.db = this.client.db(this.dbName);
      console.log('Connected to MongoDB successfully.');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
    }
  }

  async close() {
    try {
      await this.client.close();
      console.log('Connection to MongoDB closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }

  getCollection(collectionName) {
    return this.db.collection(collectionName);
  }
}

module.exports = MongoDBConnection;
