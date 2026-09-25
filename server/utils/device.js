const MOBILE_UA_REGEX = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Opera Mini/i;

// Classifies a request's User-Agent as 'mobile' (native/mobile browser) or 'desktop' (web interface)
function classifyDevice(userAgent) {
  return MOBILE_UA_REGEX.test(userAgent || '') ? 'mobile' : 'desktop';
}

module.exports = { classifyDevice };
