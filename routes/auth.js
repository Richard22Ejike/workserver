const express = require("express");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const userServices = require("../services/services");
const accountSid = "ACfa2e86e8a0da1c2c083253b2c779bf5b";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "verysecretkey";



// Sign In Route
// Exercise
authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist!" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }

    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

authRouter.post("/otp", async (req, res) => {
    userServices.createNewOTP(req.body, (error, results) => {
      if (error) {
        return next(error);
      }
      return res.status(200).send({
        message: "Success",
        data: results,
      });
    });
  });
  
  authRouter.post ("/votp", async(req, res, next) => {
    userServices.verifyOTP(req.body, (error, results) => {
      if (error) {
        return next(error);
      }
      return res.status(200).send({
        message: "Success",
        data: results,
      });
    });
  });
  const otpStorage = {};
authRouter.post('/api/generate-otp', async(req, res) => {
  try {
    const { phone} = req.body;
// Check if an OTP has already been generated for the phone number and if it has expired
const otpInfo = otpStorage[phone];
if (otpInfo && otpInfo.expiryTime > Date.now()) {
  // If OTP found not expired, send the existing OTP back in the response
  res.send({ otp: otpInfo.otp });
  return;
}

// Generate a new 6-digit OTP
const otp = otpGenerator.generate(6, {
  upperCaseAlphabets: false, 
  lowerCaseAlphabets:false,
  specialChars: false 
});

// Store the new OTP and the expiry time in memory
const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
otpStorage[phone] = { otp, expiryTime };

// Create message with One Time Password
var otpMessage = `Dear Customer, ${otp} is the One Time Password ( OTP ) for your login.`;

// Send SMS message containing OTP to destination number using Twilio
client.messages
  .create({ body: otpMessage, from: "+15104013826", to: `+234${phone}` })
  .then(message => console.log(message.sid));

// Send the new OTP back in the response
console.log(otp);
res.send({ otp });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 

  




authRouter.post('/api/verify-otp', (req, res) => {
  try {
    const { phone, otp } = req.body;

    //Check if the OTP and the expiry time are stored in memory
    const otpInfo = otpStorage[phone];
    console.log(otpInfo);
    console.log(otp);

    if (!otpInfo || otpInfo.otp !== otp || otpInfo.expiryTime < Date.now()) {
      console.log('OTP');
    }else{
    // Send a success response

    console.log('OTP verified successfully');
    }
    res.send({ otp });


 
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// SIGN UP
authRouter.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password,phone, otp } = req.body;
    const otpInfo = otpStorage[phone];
    if (!otpInfo || otpInfo.otp !== otp || otpInfo.expiryTime < Date.now()) {
      return res
      .status(400)
      .json({ msg: "Invalid otp" });
    }else{
    // Send a success response
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with same email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      orderedAt: new Date().getTime(),
    });
    user = await user.save();
    res.json(user);
   
    }
  
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
authRouter.post("/admin/signup", async (req, res) => {
  try {
    const { name, email, password, code } = req.body;
 console.log(email);
    if (code !== "posterbox1969") {
      return res.status(400).json({ msg: "Invalid code!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with same email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      name,
      type: 'admin',
      orderedAt: new Date().getTime(),
    });
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.post("/admin/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist!" });
    }

    // Check if user is an admin
    if (user.type !== 'admin') {
      return res.status(400).json({ msg: "Only admins can sign in through this endpoint." });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }

    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = authRouter;