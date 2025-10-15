const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  type: { type: String, required: true },
  address: { type: String, required: true },
  city: String,
  state: String,
  pincode: String,
  country: String
}, { _id: false });

const creditAccountSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  currentBalance: { type: Number, default: 0 },
  amountOverdue: { type: Number, default: 0 },
  accountType: String,
  status: String
}, { _id: false });

const creditReportSchema = new mongoose.Schema({
  // Basic Details
  name: { type: String, required: true },
  mobilePhone: { type: String, required: true },
  pan: { type: String, required: true, uppercase: true },
  creditScore: { type: Number, min: 300, max: 900 },
  
  // Report Summary
  reportSummary: {
    totalAccounts: { type: Number, default: 0 },
    activeAccounts: { type: Number, default: 0 },
    closedAccounts: { type: Number, default: 0 },
    currentBalanceAmount: { type: Number, default: 0 },
    securedAccountsAmount: { type: Number, default: 0 },
    unsecuredAccountsAmount: { type: Number, default: 0 },
    lastSevenDaysCreditEnquiries: { type: Number, default: 0 }
  },
  
  // Credit Accounts Information
  creditAccounts: [creditAccountSchema],
  addresses: [addressSchema],
  
  // Metadata
  originalFileName: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
  reportDate: Date,
  
  // XML processing metadata
  xmlData: {
    type: mongoose.Schema.Types.Mixed,
    select: false // Don't include in default queries to save bandwidth
  }
}, {
  timestamps: true,
  collection: 'creditreports'
});

// Indexes for better query performance
creditReportSchema.index({ pan: 1 });
creditReportSchema.index({ mobilePhone: 1 });
creditReportSchema.index({ processedAt: -1 });
creditReportSchema.index({ name: 'text' });

// Virtual for formatted PAN
creditReportSchema.virtual('formattedPAN').get(function() {
  if (this.pan && this.pan.length === 10) {
    return `${this.pan.substring(0, 5)}${'*'.repeat(4)}${this.pan.substring(9)}`;
  }
  return this.pan;
});

// Method to get summary statistics
creditReportSchema.methods.getSummary = function() {
  return {
    name: this.name,
    pan: this.formattedPAN,
    creditScore: this.creditScore,
    totalAccounts: this.reportSummary.totalAccounts,
    currentBalance: this.reportSummary.currentBalanceAmount,
    processedAt: this.processedAt
  };
};

module.exports = mongoose.model('CreditReport', creditReportSchema);

