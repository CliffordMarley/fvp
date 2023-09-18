const crypto = require('crypto');
const { createClient } = require('redis');

class RedisCache {
    constructor() {
        this.client = this.createRedisClient();
    }

        createRedisClient() {
        const redisClient = createClient({
            host: "127.0.0.1",
            port: 6379
        });

        redisClient.on('connect', () => {
            console.log('Connection to Redis Database was successful!');
        });

        redisClient.on('error', (err) => {
            console.error('Error connecting to Redis:', err.message);
            // Close the client on error to prevent further use
            redisClient.quit();
        });

        return redisClient;
    }


    async getCache(key) {
        try {
            return new Promise((resolve, reject) => {
                this.client.get(key, (err, result) => {
                    if (err) {
                        console.log(err.message);
                        resolve(null);
                    } else {
                        if(result){
                            console.log("Found results from cache!")
                        }
                        resolve(result ? JSON.parse(result) : null);
                    }
                });
            });
        } catch (err) {
            console.log(err.message);
            return null;
        }
    }

    async setCache(key, value) {
        try {
            // Set the key-value pair with an 8-hour expiration time (8 * 3600 seconds)
            await this.client.set(key, JSON.stringify(value), 'EX', 8 * 3600);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    Hash(jsonString) {
        try {
            // Create an MD5 hash object
            const md5Hash = crypto.createHash('md5');

            // Update the hash object with the JSON string
            md5Hash.update(jsonString);

            // Calculate the MD5 hash and return it as a hexadecimal string
            const hashResult = md5Hash.digest('hex');

            return hashResult;
        } catch (error) {
            console.error('Error hashing JSON:', error);
            return null;
        }
    }

    disconnect() {
        if (this.client) {
            console.log('Disconnecting Redis client');
            this.client.quit((err) => {
                if (err) {
                    console.error('Error disconnecting Redis client:', err);
                } else {
                    console.log('Redis client disconnected successfully.');
                }
            });
        }
    }
}

module.exports = RedisCache;
