
// In-memory store for OTPs (for demonstration purposes only)
// In a real application, you would use a database or a dedicated OTP service (e.g., Redis, Twilio).

// This ensures the store persists across hot reloads in development
declare global {
  var otpStore: Record<string, string> | undefined;
}

export const otpStore = global.otpStore || (global.otpStore = {});
