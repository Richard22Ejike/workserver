const User = require("../models/user");
const Kyc = require("../models/kyc");
const Withdraw = require("../models/withdraw");
const Transaction = require("../models/transaction");
const express = require("express");
const userRouter = express.Router();
const {Notifications} = require("../models/notification");
const { Delivery } = require("../models/delivery");

userRouter.post("/api/editprofile", async (req, res) => {
    try {
      const { name, email, password,_id } = req.body;
      const hashedPassword = await bcryptjs.hash(password, 8);
      let user = await User.findById(_id);
      user.name = name;
      user.email = email;
      user.password = hashedPassword;
      user = await user.save();
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  userRouter.post("/api/add-card",  async (req, res) => {
    try {
      const { 
        cardholdername,
        cardnumber,
        expiry,
        cvv,
        _id } = req.body;
      let user = await User.findById(_id);
       user.card.push({
        cardholdername,
        cardnumber,
        expiry,
        cvv
      });
      user = await user.save();
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  userRouter.post("/api/kyc",  async (req, res) => {
    try {
      const { 
        image,
        name,
        dateofbirth,
        profilepic,
        residence,
        type,
        number,
      userId } = req.body;
      let user = await User.findById(userId);
      
      if (user.verified != 'true') {
        user.kyc = [];
        // Create a new Kyc document
        let kyc = new Kyc({
          image,
          name,
          dateofbirth,
          profilepic,
          residence,
          userId,
          type,
          number
        });
  
        // Set the kyc field of the user document to the ID of the new Kyc document
        user.kyc = kyc;
  
        // Save the updated user document
        await user.save();
  
        // Save the new Kyc document
        kyc = await kyc.save();
  

  
        // Return the saved Kyc document as JSON
        res.json(kyc);
      } else {
        // If user.verified is true, return an error message
        res.status(400).json({ error: 'User already verified.' });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  userRouter.post("/api/profilepic",  async (req, res) => {
    try {
      const { 
        image,userId } = req.body;
      let user = await User.findById(userId);
      user.image = image;
      user = await user.save();
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  userRouter.post("/api/ongoing",  async (req, res) => {
    try {
        const { ongoing, userId } = req.body; 
        let user = await User.findById(userId);
        user.ongoing = ongoing;
        user = await user.save();

        const delivery = await Delivery.findOne({ _id: ongoing }); // find the delivery by id
        if (!delivery) {
            throw new Error('Delivery not found.');
        }

        user.wallet += delivery.deliveryfee; // add delivery fee to user wallet
        user = await user.save(); // save updated wallet amount
        
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
  userRouter.post("/api/add-user-notifications",  async (req, res) => {
    try {
      const { topic,  message,   } = req.body;
      let notifications = new Notifications({
        topic,
        message,
        userId:req.user,
       
      });
      notifications = await notifications.save();
      res.json(notifications);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }); 
  userRouter.get("/api/get-user-notification",  async (req, res) => {
    try {
        const notifications = await Notifications.find({ userId: req.user });
      res.json(notifications);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  userRouter.post("/api/add-schedule",  async (req, res) => {
    try {
      const { 
        to,
        from,
        date,
        _id,
       time } = req.body;

      
      
      let user = await User.findById(_id);
       user.schedule.push({
        to,
        from,
        date,
        time
      });
      user = await user.save();
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

 
  userRouter.post('/api/get-deliver-schedule', async (req, res) => {
    const { number, state1, state2, userverified} = req.body;
    if( userverified != 'true') {
      return res.status(401).send('User not verified');
    }
    const deliveries = await Delivery.find({
      start: { $lte: number },
      end: { $gte: number },
      $or: [
        { state1: state1 },
        { state1: state2 },
        { state2: state1 },
        { state2: state2 }
      ]
    }).select('_id');
  
    const deliveryIds = deliveries.map(delivery => delivery._id);
  
    const users = await User.find({
      notification: { $exists: true, $ne: null }
    });
  
    for (const user of users) {
      user.notification.push(...deliveryIds);
      await user.save();
    }
  
    res.status(200).send('Notifications updated');
  });
  userRouter.post("/api/get-user-notification/deliveries",  async (req, res) => {
    try {
      const { userId } = req.body;

    // Find the user by ID and get their notifications array
    const user = await User.findById(userId);
    const notifications = user.notification || [];
 

    // Filter out null, undefined, and empty strings from the array of notification IDs
    const notificationIds = notifications.filter(notification => notification && notification.id)
      .map(notification => notification.id);
      console.log(notificationIds);

    // Find all deliveries with an ID in the notificationIds array
    const deliveries = await Delivery.find({ _id: { $in: notificationIds } });

    res.json(deliveries);
    
    
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  userRouter.delete("/api/remove-notification",  async (req, res) => {
    try {
      const { userId, notificationId } = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { notification: { id: notificationId } } },
        { new: true }
      );
     
     
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });


  userRouter.delete("/api/remove-schedule",  async (req, res) => {
    try {
      const { userId, scheduleId } = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { schedule: { _id: scheduleId } } },
        { new: true }
      );
  
     
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

const ss = ['Akwa Ibom', 'Bayelsa', 'Cross River','Delta', 'Edo', 'Rivers'];
const sw = ['Ondo', 'Osun', 'Oyo','Ekiti', 'Lagos', 'Ogun'];
const se = ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'];
const mb = ['Benue', 'Kogi', 'Kwara','Nasarawa', 'Niger', 'Plateau', 'Abuja'];
const nw = ['Jigawa', 'Kaduna', 'Kano','Katsina', 'Kebbi', 'Sokoto','Zamfara'];
const ne = ['Adamawa', 'Bauchi', 'Borno','Gombe', 'Taraba', 'Yobe'];


userRouter.post("/api/get-quote",  async (req, res) => {
  try {
    const { state1, state2, quantity, weight } = req.body;

    let result = 0;

    // Check if the states are in different lists
    if (ss.includes(state1) && ss.includes(state2)) {
      result = 2500;
    } else if (sw.includes(state1) && sw.includes(state2)) {
      result = 2500;
    } else if (se.includes(state1) && se.includes(state2)) {
      result = 2500;
    } else if (mb.includes(state1) && mb.includes(state2)) {
      result = 2500;
    } else if (nw.includes(state1) && nw.includes(state2)) {
      result = 2500;
    } else if (ne.includes(state1) && ne.includes(state2)) {
      result = 2500;
    } else {
      result = 3500;
    }
    if (ss.includes(state1) && mb.includes(state2) || ss.includes(state2) && mb.includes(state1)) {
      result = 4500;
    }
    if (se.includes(state1) && mb.includes(state2) || se.includes(state2) && mb.includes(state1)) {
      result = 4000;
    }
    if (sw.includes(state1) && mb.includes(state2) || sw.includes(state2) && mb.includes(state1)) {
      result = 4000;
    }
    // Increase the result based on quantity
    result += quantity * 500;

    // Increase the result based on weight
    if (weight === 1) {
      result += 500;
    } else if (weight === 2) {
      result += 1000;
    } else if (weight === 3) {
      result += 1500;
    }

    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.post("/api/withdraw",  async (req, res) => {
  try {
    const { 
     userId,
     account,
     amount,
     name,username } = req.body;
     let user = await User.findById(userId);
    if (user.wallet < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    user.wallet -= amount;
    let withdraw = new Withdraw({
      name,
      amount, // update with adjusted delivery fee
      account,
      userId,
      username:username,
    });

    let transaction = new Transaction({
      username:username,
      cost: amount, // update with adjusted delivery fee
      type:'debit',
      userId,
      createdAt: new Date().getTime(),
    });
    withdraw = await withdraw.save();
    transaction = await transaction.save();
    user = await user.save(); 


    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



userRouter.post("/api/add-fund",  async (req, res) => {
  try {
    const { 
     userId,
     amount,
     name,
    } = req.body;
     let user = await User.findById(userId);
   
  
    user.wallet += amount;
    let transaction = new Transaction({
      username:name,
      cost: amount, // update with adjusted delivery fee
      type:'credit',
      userId,
      createdAt: new Date().getTime(),
    });
    transaction = await transaction.save(); 
    user = await user.save(); 
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



  module.exports = userRouter;