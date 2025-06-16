import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  recipientName: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  },
  sentAt: {
    type: Date,
  },
  failureReason: {
    type: String,
  },
  orderId: {
    type: String,
    sparse: true, // Allow multiple docs without orderId
  },
  userId: {
    type: String,
    sparse: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // For storing any additional data
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Indexes for faster lookups
emailLogSchema.index({ recipientEmail: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ sentAt: -1 });
emailLogSchema.index({ orderId: 1 });
emailLogSchema.index({ templateId: 1 });
emailLogSchema.index({ createdAt: -1 });

const EmailLog = mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);

export default EmailLog; 