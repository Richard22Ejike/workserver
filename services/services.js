
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "verysecretkey"; // Key for cryptograpy. Keep it secret
const accountSid = "ACfa2e86e8a0da1c2c083253b2c779bf5b";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
async function createNewOTP(params, callback) {
    // Generate a 4 digit numeric OTP
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false, 
        lowerCaseAlphabets:false,
        specialChars: false 
    });
    const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
    const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
    const data = `${params.phone}.${otp}.${expires}`; // phone.otp.expiry_timestamp
    const hash = crypto.createHmac("sha256", key).update(data).digest("hex"); // creating SHA256 hash of the data
    const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
    // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
    //sendSMS(phone, `Your OTP is ${otp}. it will expire in 5 minutes`);
  
    console.log(`Your OTP is ${otp}. it will expire in 5 minutes`);
  
    var otpMessage = `Dear Customer, ${otp} is the One Time Password ( OTP ) for your login.`;
  


   client.messages
  .create({ body: otpMessage, from: "+15104013826", to: `+234${params.phone}` })
  .then(message => console.log(message.sid));
  
    return callback(null, fullHash);
  }
  
  async function verifyOTP(params, callback) {
    // Separate Hash value and expires from the hash returned from the user
    let [hashValue, expires] = params.hash.split(".");
    // Check if expiry time has passed
    let now = Date.now();
    if (now > parseInt(expires)) return callback("OTP Expired");
    console.log(parseInt(expires));
    // Calculate new hash with the same key and the same algorithm
    let data = `${params.phone}.${params.otp}.${expires}`;
    let newCalculatedHash = crypto
      .createHmac("sha256", key)
      .update(data)
      .digest("hex");
    // Match the hashes
    console.log(newCalculatedHash);
    console.log(hashValue);
    if (newCalculatedHash === hashValue) {
      return callback(null, "Success");
    }
    return callback("Invalid OTP");
  }

  module.exports = {
  
    createNewOTP,
    verifyOTP,
  };