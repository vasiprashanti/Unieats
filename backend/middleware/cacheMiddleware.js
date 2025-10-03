import NodeCache from "node-cache";

// Initialize the cache. The stdTTL is the default time-to-live in seconds for every key.
const myCache = new NodeCache({ stdTTL: 120 }); // Default cache for 2 minutes

const cacheMiddleware = (duration) => (req, res, next) => {
  // --- THIS IS THE KEY GENERATION ---
  // We create a unique key for each request based on its URL.
  const key = req.originalUrl || req.url;

  // --- THIS IS THE FIX ---
  // 1. Safety Check: If for some reason we couldn't generate a key,
  //    we skip the cache entirely to prevent a crash.
  if (!key) {
    return next();
  }

  // 2. Check if we have a cached response for this key.
  const cachedResponse = myCache.get(key);

  // If a cached response exists, send it immediately.
  if (cachedResponse) {
    console.log(`CACHE HIT: Serving from cache for key: ${key}`);
    return res.send(cachedResponse);
  } else {
    // If no cached response, we prepare to create one.
    console.log(`CACHE MISS: No cache found for key: ${key}`);

    // We hijack the 'send' function.
    const originalSend = res.send;
    res.send = (body) => {
      // When the controller is done and calls 'res.send()',
      // we will cache the response body before sending it.
      myCache.set(key, body, duration);
      originalSend.call(res, body);
    };
    next();
  }
};

// Function to clear cache, useful for admin actions
const clearCache = (key) => {
  if (cache.has(key)) {
    cache.del(key);
    console.log(`Cache cleared for key: ${key}`);
  }
  // Also clear related keys, e.g., clear the list when one item changes
  if (key.includes("/api/v1/content/")) {
    cache.del("/api/v1/content");
    console.log(`Cache cleared for key: /api/v1/content`);
  }
};

export { cacheMiddleware, clearCache };
