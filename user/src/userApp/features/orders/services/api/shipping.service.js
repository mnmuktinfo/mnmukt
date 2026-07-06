const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

// Fallback to localhost if env variable is missing
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5000/api/v1';

export const ShippingService = {
  /**
   * Checks delivery availability and COD status for a given pincode.
   */
  checkServiceability: async (pincode, options = {}) => {
    if (isDev) console.log(`🌐 [ShippingService] Checking delivery for PIN: ${pincode}`);

    const response = await fetch(
      `${API_BASE_URL}/shipments/check-delivery/${pincode}`, 
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: options.signal, // ✅ Signal perfectly passed to prevent race conditions
      }
    );

    // 🛡️ GUARD: Handle API errors defensively before assuming the response is JSON
    if (!response.ok) {
      let errorMessage = "Failed to check delivery availability";
      
      try {
        // Attempt to parse standard backend JSON error
        const errData = await response.json();
        errorMessage = errData.message || errorMessage;
      } catch (e) {
        // Fallback if Cloudflare/Nginx throws an HTML error page (502, 503)
        errorMessage = `Server Error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Safely parse JSON on a 200 OK response
    return await response.json();
  }
};