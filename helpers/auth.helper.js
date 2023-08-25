const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const signJSONWebToken = (data) => {
  try {
    let token = jwt.sign({ data }, process.env.JWT_SYMMETRIC_KEY, { expiresIn: '30d', algorithm: 'HS256' });
    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw error;
  }
}

const verifyJSONWebToken = (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SYMMETRIC_KEY);
      return decoded
    } catch (error) {
      console.error('Error verifying JWT:', error);
      return false
    }
  }


module.exports = { signJSONWebToken, verifyJSONWebToken };
