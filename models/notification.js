const mongoose = require('mongoose');


const notificationSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },

    topic: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },

   
});

 const Notifications= mongoose.model('Notifications', notificationSchema);
 module.exports = { Notifications, notificationSchema };
