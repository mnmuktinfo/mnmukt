// src/features/orders/services/shippingService.js

import { orderService } from "./orderService";

export const shippingService = {
  async checkServiceability(pincode, signal) {
    try {
      const response = await orderService.checkServiceability(
        pincode,
        { signal }
      );

      if (!response?.success) {
        return {
          success: false,
          data: null,
          error: "Delivery not available",
        };
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      if (
        error.name === "AbortError" ||
        error.name === "CanceledError"
      ) {
        throw error;
      }

      return {
        success: false,
        data: null,
        error: "Could not check delivery availability",
      };
    }
  },
};