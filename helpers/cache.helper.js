const crypto = require('crypto');
const { createClient } = require('redis');

const redisConnect = () => {
  const redisClient = createClient();

  redisClient.on('connect', () => {
    console.log('Connection to Redis Database was successful!');
  });

  redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
    // Close the client on error to prevent further use
    redisClient.quit();
  });

  return redisClient;
};



const setCache = async (key, value) => {
    let client = null;
    try {
        client = await redisConnect();

        if (client) {
            // Set the key-value pair with an 8-hour expiration time (8 * 3600 seconds)
            await client.set(key, JSON.stringify(value), 'EX', 8 * 3600);
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (client !== null) {
            client.disconnect();
        }
    }
};

module.exports = {setCache, getCache, Hash}
