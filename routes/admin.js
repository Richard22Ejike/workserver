const express = require("express");
const adminRouter = express.Router();
const User = require("../models/user");
const Kyc = require("../models/kyc");
const admin = require("../middlewares/admin");
const { Delivery } = require("../models/delivery");
const  Transaction  = require("../models/transaction");
const Withdraw = require("../models/withdraw");
// Add product
adminRouter.post("/admin/add-product", admin, async (req, res) => {
  try {
  
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



// Get all your products
adminRouter.get("/admin/users",  async (req, res) => {
    try {
        const users = await User.find({ verified: "" }).select("-password");
        res.json(users);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
});

// Delete the product
adminRouter.post("/admin/delete-product",  async (req, res) => {
  try {
  
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


adminRouter.post("/admin/get-deliveries", async (req, res) => {
  const { id, name, userId } = req.body;
  let searchRegexes = {};
  if (id) {
    searchRegexes._id = new RegExp(id, 'i');
  }

  if (name) {
    searchRegexes.sendername = new RegExp(name, 'i');
  }

  if (userId) {
    searchRegexes.userId = new RegExp(userId, 'i');
  }
  try {
    const deliveries = await Delivery.find(searchRegexes);
    
    const productsWithStats = await Promise.all(
      deliveries.map(async (delivery) => {
        const stat = await Delivery.find({
          deliveryId: delivery._id,
        });
        return {
          ...delivery._doc,
          stat,
        };
      })
    );
    productsWithStats.reverse();
    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





adminRouter.post("/admin/allUser", async (req, res) => {
  const { id, name, email } = req.body;
  const searchRegexes = { verified: false};

  if (id) {
    searchRegexes._id = new RegExp(id, 'i');
  }

  if (name) {
    searchRegexes.name = new RegExp(name, 'i');
  }

  if (email) {
    searchRegexes.email = new RegExp(email, 'i');
  }

  try {
    const users = await User.find(searchRegexes);
    users.reverse();
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
adminRouter.post("/admin/alldeliver", async (req, res) => {
  const { id, name, email } = req.body;
  let searchRegexes = { verified: true };
  
  if (id) {
    searchRegexes._id = new RegExp(id, 'i');
  }

  if (name) {
    searchRegexes.name = new RegExp(name, 'i');
  }

  if (email) {
    searchRegexes.email = new RegExp(email, 'i');
  }

  try {
    const users = await User.find(searchRegexes);
    users.reverse();
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

adminRouter.get("/admin/allunverifiedUser", async (req, res) => {
  try {
    // Find all the Kyc documents
    const kycs = await Kyc.find();

    // Return the Kyc documents as JSON
    res.json(kycs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.post('/admin/verifyUser', async (req, res) => {
  try {
    const { id} = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verified = 'true';
    await user.save();

    // Delete all KYC documents belonging to the user
    await Kyc.deleteMany({ userId: id });

    res.status(200).json({ message: 'User verified successfully and KYC documents deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


adminRouter.post('/admin/reset-kyc', async (req, res) => {
  try {
    const { id} = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    

    await user.save();
    await Kyc.deleteMany({ userId: id });
    
    res.status(200).json({ message: 'KYC reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

adminRouter.get("/admin/allTransaction", async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    transactions.reverse();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});


adminRouter.get("/admin/allWithdraw", async (req, res) => {
  try {
    const withdraws = await Withdraw.find();
    const paidWithdraws = [];
    const unpaidWithdraws = [];
    // Separating the paid and unpaid withdraw records
    for (let i = 0; i < withdraws.length; i++) {
      if (withdraws[i].paid) {
        paidWithdraws.push(withdraws[i]);
      } else {
        unpaidWithdraws.push(withdraws[i]);
      }
    }
    // Combining the records to send back in the response
    const sortedWithdraws = [...unpaidWithdraws, ...paidWithdraws];
    res.status(200).json(sortedWithdraws);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

adminRouter.post('/admin/paid', async (req, res) => {
  try {
    const {id} = req.body;
    const withdraw = await Withdraw.findById(id);

    if (!withdraw) {
      return res.status(404).json({ message: 'User not found' });
    }

    withdraw.paid = 'true';
    await withdraw.save();

    res.status(200).json({ message: 'User withdraw successfully ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = adminRouter;