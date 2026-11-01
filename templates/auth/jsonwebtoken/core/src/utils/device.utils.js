// utils/device.utils.js
import { UAParser } from 'ua-parser-js';

export const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();

  return {
    ip: req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    device: {
      browser: result.browser.name || 'unknown',
      os: result.os.name || 'unknown',
      deviceType: result.device.type || 'desktop', // ua-parser returns undefined for desktop
    },
  };
};
