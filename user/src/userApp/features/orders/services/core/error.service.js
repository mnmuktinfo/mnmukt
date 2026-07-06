import { ERROR_MESSAGES } from "../schema";

const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

export const ErrorService = {
  /**
   * Safely extracts a human-readable string from any error object.
   */
  getErrorMessage: (error) => {
    if (isDev) console.error("🛠️ [ErrorService] Raw Error:", error);

    if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;

    // 1. Handle our custom string throws or API message strings
    if (typeof error === "string") return error;

    // 2. Handle Axios/Network errors (error.response.data.message)
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }

    // 3. Handle standard JavaScript Error objects
    if (error.message) return error.message;

    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },
};