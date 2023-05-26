const express = require ('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var helmet = require('helmet');


const mongoose = require("mongoose");
require('dotenv').config();
const otpGenerator = require("otp-generator");
const deliveryRouter = require("./routes/delivery");

const PORT = 3000;
const DB = "mongodb+srv://richard:liverpool@cluster0.vxcma1z.mongodb.net/?retryWrites=true&w=majority";

const app = express();

// IMPORTS FROM OTHER FILES
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(express.json());
app.use(authRouter);
app.use(deliveryRouter);
app.use(userRouter);
app.use(adminRouter);
// Connections
mongoose
  .set('strictQuery', false)
  .connect(DB)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((e) => {
   
  });

app.listen(PORT,"0.0.0.0", () => {
     console.log(`connected at port ${PORT}`  );
})