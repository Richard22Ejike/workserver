const express = require("express");
const deliveryRouter = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/user");
const { Delivery } = require("../models/delivery");
const  Transaction  = require("../models/transaction");
deliveryRouter.post("/api/add-delivery", async (req, res) => {
  try {
    const { 
      username, 
      deliveryfee, 
      deliveryinstructions, 
      deliveryweight, 
      deliverytimeline, 
      recevieraddress,
      receviername,
      receviernumber,
      sendername, 
      sendernumber,
      deliverydate,
      senderaddress,
      progress,
      usernumber,
      state1,
      state2,
      start,
      end,
      wallet,
      userId,
      senderusername
    } = req.body;
    let user = await User.findById(userId);
    // check if wallet is true or false, and adjust the delivery fee accordingly
    let finalDeliveryFee = deliveryfee;
    if (wallet) {
      finalDeliveryFee = parseFloat(deliveryfee);
    }

    // check if delivery fee is greater than available wallet balance
    if (wallet && user.wallet < finalDeliveryFee) {
      return res.status(400).json({ msg: "Insufficient Balance" });
    }
    let transaction = new Transaction({
      username, 
      cost: finalDeliveryFee, // update with adjusted delivery fee
      type:'Debits',
      userId,
      createdAt: new Date().getTime(),
    });
    let delivery = new Delivery({
      username, 
      deliveryfee: finalDeliveryFee, // update with adjusted delivery fee
      deliveryinstructions, 
      deliveryweight, 
      deliverytimeline, 
      recevieraddress,
      receviername,
      receviernumber,
      deliverydate,
      sendername,  
      sendernumber,
      senderaddress,
      progress,
      usernumber,
      state1,
      state2,
      start,
      end,
      wallet,
      senderusername,
      userId,
      orderedAt: new Date().getTime(),
    });

    if (wallet) {
          console.log(user.wallet);
      user.wallet -= finalDeliveryFee; // subtract delivery fee from user's wallet balance if wallet is true
      await user.save();
    }

    delivery = await delivery.save();
    transaction = await transaction.save();
    res.json(delivery);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

  deliveryRouter.post("/api/track-delivery", async (req, res) => {
    try {
      const { 
        _id 
       } = req.body;
       console.log(_id);
      let delivery = await Delivery.findById(_id);
   
 
      res.json(delivery);
    } catch (e) {
      console.log(e.message);
      res.status(500).json({ error: e.message });
    }
  });

  deliveryRouter.post("/api/accept-delivery/", async (req, res) => {
    try {
      const { 
        username,
        progress,
        usernumber,
        _id,
        ongoing,
        notificationId,
        deliverId
       } = req.body;
         const users = await User.findByIdAndUpdate(
          deliverId,
        { $pull: { notification: { id: notificationId } } },
        { new: true }
      );
      let delivery = await Delivery.findById(_id);
      let user = await User.findById( deliverId);
      if(delivery.username == '' && user.ongoing == '' && delivery.userId != deliverId){
        delivery.username = username;
        delivery.progress = progress;
        delivery.usernumber = usernumber;
        delivery.deliverId = deliverId;
        user.ongoing = ongoing;
        user = await user.save();
        delivery = await delivery.save();
        res.json(delivery);
      }
      else{
        return res
        .status(400)
        .json({ msg: `delivery request has been taken` });
      }
      
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  deliveryRouter.post("/api/get-products", async (req, res) => {
    try {
        const { 
            username,
           } = req.body;
      let delivery = await Delivery.findById(username);
    
      res.json(delivery);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  deliveryRouter.get("/api/get-delivery",  async (req, res) => {
    try {
      const deliverys = await Delivery.find({});
      res.json(deliverys);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  
  deliveryRouter.get("/api/delivery/", async (req, res) => {
    try {
      if (!req.query.searchTerm) {
        return res.status(400).json({ error: "Missing search term" });
      }
  
     
      
      const deliveries = await Delivery.find({
        $or: [
          { userId: req.query.searchTerm },
          { deliverId: req.query.searchTerm },
         
        ]
      }).lean().limit(100);
       
   
  
      console.log(deliveries);
      return res.json(deliveries);
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ error: e.message });
    }
  });
  
  deliveryRouter.get("/api/delivery/search/:id",  async (req, res) => {
    try {
      const delivery = await Delivery.find({
        name: { $regex: req.params.id, $options: "i" },
      });
  
      res.json(delivery);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  deliveryRouter.post("/api/find-deliver",  async (req, res) => {
    
  
    try {
     
      const { id,start,end,state1,state2} = req.body;
      const startObj = { value: start };
      const endObj = { value: end };

  
    // Find users with schedules that fall within the provided range
    const users = await User.find({ "schedule.date": { 
      $gte: startObj.value,
      $lte: endObj.value 
    },
    $or: [
      { "schedule.to": state1, "schedule.from": state2 },
      { "schedule.to": state2, "schedule.from": state1 },
    ] });
     
    // Add the message to each user's notification list
    const promises = users.map(user => {
      user.notification.push({ id });
      return user.save();
    });

    // Wait for all user documents to be saved
    await Promise.all(promises);
 
    res.json(users);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  deliveryRouter.post("/api/change-order-status",  async (req, res) => {
    try {
      const { id, progress,userId } = req.body;
      let delivery= await Delivery.findById(id);
      let user = await User.findById(userId);
      delivery.progress = progress;
      if (progress === 'DELIVERED') {
        user.deliveriesDone++;
      }
      delivery = await delivery.save();
      res.json(delivery);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });


  module.exports = deliveryRouter;
  