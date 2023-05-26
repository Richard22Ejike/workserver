const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
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

});

const Card = mongoose.model("Card", cardSchema);
module.exports = Card;