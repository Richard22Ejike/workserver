const mongoose = require("mongoose");

const kycSchema = mongoose.Schema({
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
    userId:{
        type: String,
        default: "",
      },
    image: {
      type: String,
      default: "",
      trim: true,
  },
  profilepic: {
    type: String,
    default: "",
    trim: true,
},
    
      

});

const Kyc = mongoose.model("Kyc", kycSchema);
module.exports = Kyc;