import NodeCache from "node-cache";

// Initialize cache with a standard TTL (Time To Live) of 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl; // Use the URL as the cache key
  const cachedResponse = cache.get(key);

    if (cachedResponse) {
        console.log(`Cache hit for key: ${key}`);
        return res.status(200).json(cachedResponse);
    } else {
        console.log(`Cache miss for key: ${key}`);
        // If not in cache, proceed to the controller, but override res.json
        const originalJson = res.json;
        res.json = (body) => {
            // Cache the response before sending it
            cache.set(key, body);
            originalJson.call(res, body);
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
    if (key.includes('/api/v1/content/')) {
        cache.del('/api/v1/content');
        console.log(`Cache cleared for key: /api/v1/content`);
    }
};

export { cacheMiddleware, clearCache };
