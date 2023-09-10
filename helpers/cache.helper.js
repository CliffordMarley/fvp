const crypto = require('crypto');
const {createClient} = require('redis')


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
  


const Hash = (jsonString)=>{
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

const getCache = async (key) => {
    let client = null;
    try {
        client = await redisConnect();

        if (client) {
            return new Promise((resolve, reject) => {
                client.get(key, (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result ? JSON.parse(result) : null);
                    }
                });
            });
        } else {
            return null;
        }
    } catch (err) {
        console.error(err.message);
        return null;
    } finally {
        if (client !== null) {
            client.quit(); // Use quit() to disconnect from Redis
        }
    }
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
            client.quit();
        }
    }
};

module.exports = {setCache, getCache, Hash}
