const BASE_URL = 'https://apitxt.com';

function getApiKey() {
  const apiKey = process.env.API_TXT_API_KEY;
  if (!apiKey) throw new Error('API_TXT_API_KEY is not configured');
  return apiKey;
}

// apitxt.com only dispatches a pre-generated OTP over SMS — it does not
// generate or verify OTPs itself. We own OTP generation, storage/expiry and
// verification (see models/Otp.js and routes/otp.js). A plain 10-digit phone
// is accepted as-is; apitxt auto-prepends the 91 (India) country code.
async function sendOtpSms(phone10, otp) {
  const apiKey = getApiKey();
  const params = new URLSearchParams({ authkey: apiKey, mobile: phone10, otp });

  const response = await fetch(`${BASE_URL}/api/sendOTP?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to send OTP');
  }
  return data;
}

module.exports = { sendOtpSms };
