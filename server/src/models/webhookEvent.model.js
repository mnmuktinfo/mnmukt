'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const WebhookEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, required: true },
    eventType: { type: String, required: true },
  },
  { timestamps: true }
);

const WebhookEvent = mongoose.model('WebhookEvent', WebhookEventSchema);

module.exports = { WebhookEvent };