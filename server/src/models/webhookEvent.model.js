'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const webhookEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, required: true, default: 'razorpay' },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

module.exports = { WebhookEvent };