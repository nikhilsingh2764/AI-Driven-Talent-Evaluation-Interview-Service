import jwt from "jsonwebtoken";

// Generate JWT (Access Token or Refresh Token)
const generateToken = (payload, secret, expiresIn) => {

    return jwt.sign(
        payload,      // Data to store inside token
        secret,       // Secret key
        {
            expiresIn // Token expiry time
        }
    );

};

export default generateToken;

