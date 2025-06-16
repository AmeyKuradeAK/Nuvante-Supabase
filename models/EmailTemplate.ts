import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  plainTextContent: {
    type: String,
    required: true,
  },
  templateType: {
    type: String,
    required: true,
    enum: ['order_confirmation', 'order_shipped', 'order_delivered', 'welcome', 'password_reset', 'newsletter', 'custom'],
    default: 'custom'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  lastEditedBy: {
    type: String,
    required: true,
  },
  variables: [{
    name: String,
    description: String,
    example: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Index for faster lookups
emailTemplateSchema.index({ templateType: 1 });
emailTemplateSchema.index({ isActive: 1 });
emailTemplateSchema.index({ name: 1 });

// Update the updatedAt field on save
emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", emailTemplateSchema);

export default EmailTemplate; 