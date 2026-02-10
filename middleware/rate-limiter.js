// Simple in-memory rate limiter
const rateLimits = new Map();

/**
 * Rate limiting middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Custom error message
 */
function rateLimit(maxRequests = 100, windowMs = 60000, message = 'Too many requests, please try again later') {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!rateLimits.has(key)) {
            rateLimits.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        
        const limit = rateLimits.get(key);
        
        // Reset if window expired
        if (now > limit.resetTime) {
            rateLimits.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        
        // Increment count
        limit.count++;
        
        // Check if exceeded
        if (limit.count > maxRequests) {
            return res.status(429).json({
                success: false,
                message: message,
                retryAfter: Math.ceil((limit.resetTime - now) / 1000) // seconds
            });
        }
        
        next();
    };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimits.entries()) {
        if (now > value.resetTime) {
            rateLimits.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Function to clear all rate limit records (for testing/debugging)
function clearRateLimits() {
    rateLimits.clear();
}

// Function to clear rate limits for specific IP
function clearRateLimitForIp(ip) {
    rateLimits.delete(ip);
}

module.exports = {
    rateLimit,
    clearRateLimits,
    clearRateLimitForIp,
    // Preset rate limiters
    strictLimit: rateLimit(20, 60000, 'Too many requests. Please wait a moment.'), // 20 req/min
    normalLimit: rateLimit(100, 60000, 'Rate limit exceeded.'), // 100 req/min
    loginLimit: rateLimit(5, 60000, 'Too many login attempts. Please try again later.'), // 5 attempts/min
};
