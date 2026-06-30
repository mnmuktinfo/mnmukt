/**
 * Auth Utilities - Helper functions for authentication workflows
 */

// ── Email Validation ──
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

// ── Password Validation ──
export const validatePassword = (password, isRegister = false) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
  } else {
    if (isRegister && password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (isRegister && !/[A-Z]/.test(password)) {
      errors.push("Password must include an uppercase letter");
    }
    if (isRegister && !/[0-9]/.test(password)) {
      errors.push("Password must include a number");
    }
  }

  return errors;
};

// ── Password Match Validation ──
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

// ── Name Validation ──
export const validateName = (name) => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Name is required";
  }
  if (trimmed.length < 2) {
    return "Name must be at least 2 characters";
  }
  if (trimmed.length > 100) {
    return "Name must be less than 100 characters";
  }
  return null;
};

// ── Password Strength Calculator ──
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      label: "No password",
      color: "bg-gray-200",
      percentage: 0,
    };
  }

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const finalScore = Math.min(score, 6);
  const strengthMap = {
    0: { label: "Very weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-red-400" },
    2: { label: "Fair", color: "bg-yellow-500" },
    3: { label: "Good", color: "bg-yellow-400" },
    4: { label: "Strong", color: "bg-lime-500" },
    5: { label: "Very strong", color: "bg-green-500" },
    6: { label: "Very strong", color: "bg-green-600" },
  };

  return {
    score: finalScore,
    percentage: (finalScore / 6) * 100,
    ...strengthMap[finalScore],
  };
};

// ── Firebase Error Handler ──
export const handleFirebaseError = (error) => {
  const errorMap = {
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/email-already-in-use": "Email is already registered",
    "auth/weak-password": "Password is too weak",
    "auth/invalid-email": "Invalid email format",
    "auth/too-many-requests": "Too many failed attempts. Try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/user-disabled": "This account has been disabled",
  };

  // Check for custom error messages
  if (error.message?.includes("Unauthorized")) {
    return "Only admins can access this area";
  }

  if (error.message?.includes("blocked")) {
    return "Your account has been blocked";
  }

  // Return mapped Firebase error or generic message
  return errorMap[error.code] || error.message || "An error occurred";
};

// ── Session Storage Manager ──
export const sessionStorage = {
  set(key, value, expirationMs = null) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        expiresAt: expirationMs ? Date.now() + expirationMs : null,
      };
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error("Storage error:", err);
      return false;
    }
  },

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const data = JSON.parse(raw);

      // Check expiration
      if (data.expiresAt && data.expiresAt < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }

      return data.value;
    } catch (err) {
      console.error("Storage read error:", err);
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error("Storage remove error:", err);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      console.error("Storage clear error:", err);
      return false;
    }
  },
};

// ── Debounce Utility ──
export const debounce = (func, delay) => {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ── Throttle Utility ──
export const throttle = (func, limit) => {
  let inThrottle;

  return function throttled(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ── Format Time Remaining ──
export const formatTimeRemaining = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

// ── Request Deduplicator ──
export class RequestDeduplicator {
  constructor() {
    this.pending = new Map();
  }

  async execute(key, fn) {
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fn()
      .then((result) => {
        this.pending.delete(key);
        return result;
      })
      .catch((error) => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  clear() {
    this.pending.clear();
  }
}

// ── Logger ──
export const logger = {
  info: (message, data) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[INFO] ${message}`, data || "");
    }
  },

  warn: (message, data) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[WARN] ${message}`, data || "");
    }
  },

  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error || "");
  },
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  calculatePasswordStrength,
  handleFirebaseError,
  sessionStorage,
  debounce,
  throttle,
  formatTimeRemaining,
  RequestDeduplicator,
  logger,
};