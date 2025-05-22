import mongoose from "mongoose";

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  items: string[];
}

let clientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  cart: {
    type: Array,
    required: true,
  },
  cartQuantities: {
    type: Map,
    of: Number,
    default: new Map()
  },
  wishlist: {
    type: Array,
    required: true,
  },
  orders: {
    type: [{
      orderId: String,
      paymentId: String,
      amount: Number,
      currency: String,
      status: String,
      timestamp: String,
      items: [String]
    }],
    required: true,
    default: []
  }
});

// let clientModel = mongoose.model("Client", clientSchema);

let clientModel =
  mongoose.models.Client || mongoose.model("Client", clientSchema);

export default clientModel;
