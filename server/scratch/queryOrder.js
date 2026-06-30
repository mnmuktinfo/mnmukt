require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Order = require("../src/models/Order");

async function main() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB.");

  const orderId = "MNMU-9B97AC762326";
  const order = await Order.findOne({ orderId });

  if (!order) {
    console.log(`Order ${orderId} not found in MongoDB.`);
  } else {
    console.log("Found order. Current payment status:", order.payment.status);
    
    // Update payment status to paid
    order.payment.status = "paid";
    order.payment.amountPaid = order.pricing.total;
    order.markModified("payment");
    
    await order.save();
    console.log("Updated order payment status to 'paid'.");
  }

  await mongoose.connection.close();
}

main().catch(console.error);
