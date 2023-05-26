const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId:{
        default: "",
        type:String,
        trim: true,
    },
    username:{
        default: "",
        type:String,
        trim: true,
    },
    cost: {
        default: "",
        type: String,
        trim: true,
    },
    createdAt: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        default: "",
        trim: true,
    },
    
  },
 
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;

