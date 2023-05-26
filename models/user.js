const mongoose = require("mongoose");
const { cardSchema } = require("./card");
const { kycSchema } = require("./withdraw");

const userSchema = mongoose.Schema({
    name:{
        required:true,
        type:String,
        trim: true,
    },
    email:{
        required: true,
        type: String,
        trim: true,
        // validate the email structure
        validate: {
          validator: (value) => {
            const re =
              /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return value.match(re);
          },
          message: "Please enter a valid email address",
        },
    },
    password: {
        required: true,
        type: String,
    },
    address: {
        type: String,
        default: "",
    },
    type: {
      type: String,
      default: "user",
    },
    phone: {
        type: String,
        default: "",
    },
    image: {
      type: String,
      default: "",
  },
    wallet: {
      type: Number,
      default: 0,
  },
   verified: {
    type: String,
    default: "false",
  },
  ongoing: {
    type: String,
    default: "",
  },
    card: [
      {
        cardholdername:{
          default: "",
          type:String,
          trim: true,
      },
      cardnumber: {
          default: "",
          type: String,
          trim: true,
      },
      expiry: {
          type: String,
          default: "",
          trim: true,
      },
      cvv: {
          type: String,
          default: "",
          trim: true,
      },
      deliveriesDone: {
        type: Number,
        default:0,
        trim:true,
      }

      },
    ],
    kyc: [
      {
          name:{
        default: "",
        type:String,
        trim: true,
    },
    dateofbirth: {
        default: "",
        type: String,
        trim: true,
    },
    residence: {
        type: String,
        default: "",
        trim: true,
    },
    type: {
        type: String,
        default: "",
        trim: true,
    },
    number: {
        type: String,
        default: "",
        trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
  },
       
      },
    ],
    schedule: [
        {
            to:{
          default: "",
          type:String,
          trim: true,
      },
      from: {
          default: "",
          type: String,
          trim: true,
      },  
      time: {
        default: "",
        type: String,
        trim: true,
    },
    date: {
      default: 0,
      type: Number,
      trim: true,
  },

        },
      ],
    

      notification: [
        {
            id:{
          default: "",
          type:String,
          trim: true,
      },
      
 

        },
      ],
      orderedAt: {
        type: Number,
        required: true,
      },
      

});

const User = mongoose.model("User", userSchema);
module.exports = User;