'use strict';

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  COD_PENDING: 'cod_pending',
});

module.exports = { PAYMENT_STATUS };