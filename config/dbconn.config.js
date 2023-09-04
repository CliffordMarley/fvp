const { MongoClient } = require('mongodb');

class MongoDBConnection {
  constructor(dbName) {
    if (!MongoDBConnection.instance) {
      this.dbName = dbName;
      this.url = 'mongodb://aip_validator:Angelsdie1997@localhost.mw:27017/?authMechanism=DEFAULT';
      this.client = null;
      this.db = null;
      this.isConnected = false;
      MongoDBConnection.instance = this;
    }
    return MongoDBConnection.instance;
  }

  async connect() {
    if (this.isConnected) {
      console.log('Connection already established.');
      return;
    }

    try {
      this.client = await MongoClient.connect(this.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      console.log('Connected to MongoDB successfully.');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      throw err;
    }
  }

  async close() {
    try {
      await this.client.close();
      this.isConnected = false;
      console.log('Connection to MongoDB closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }

  getCollection(collectionName) {
    if (!this.isConnected) {
      throw new Error('Collection not initialized. Call connect() before using the model.');
    }
    return this.db.collection(collectionName);
  }
}

module.exports = new MongoDBConnection('aip_validator');
