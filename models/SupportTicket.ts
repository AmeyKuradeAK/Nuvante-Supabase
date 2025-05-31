import mongoose from "mongoose";

let supportTicketSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  issueType: {
    type: String,
    required: true,
    enum: [
      "Technical Issue",
      "Order Related",
      "Payment Issue",
      "Shipping & Delivery",
      "Product Quality",
      "Return & Refund",
      "Account Issue",
      "Website Bug",
      "Feature Request",
      "Other"
    ]
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  details: {
    type: String,
    required: true,
    maxlength: 2000
  },
  images: {
    type: [String], // Array of image URLs or file paths
    default: []
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  adminNotes: {
    type: String,
    default: ""
  }
});

// Auto-update the updatedAt field
supportTicketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

let supportTicketModel = 
  mongoose.models.SupportTicket || mongoose.model("SupportTicket", supportTicketSchema);

export default supportTicketModel; 