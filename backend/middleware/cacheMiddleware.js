// In middleware/cacheMiddleware.js

import NodeCache from 'node-cache';

// --- THE TOOLBOX ---
// We create our one and only cache instance here and give it a specific name.
const myCache = new NodeCache({ stdTTL: 120 }); // Default cache for 2 minutes

// --- THE MIDDLEWARE (The Gatekeeper) ---
// This function is already correct and does not need changes.
const cacheMiddleware = (duration) => (req, res, next) => {
    const key = req.originalUrl || req.url;
    if (!key) {
        return next();
    }
    
    const cachedResponse = myCache.get(key);

    if (cachedResponse) {
        console.log("CACHE HIT: Serving from cache for key: ${key}");
        return res.send(cachedResponse);
    } else {
        console.log("CACHE MISS: No cache found for key: ${key}");
        const originalSend = res.send;
        res.send = (body) => {
            myCache.set(key, body, duration);
            originalSend.call(res, body);
        };
        next();
    }
};


// --- THE HELPER FUNCTION (The Janitor) ---
// This is the function we are fixing.
const clearCache = (key) => {
    // --- THE FIX ---
    // We tell the function to use the specific 'myCache' toolbox that we defined at the top.
    if (myCache.has(key)) {
        myCache.del(key);
        console.log("CACHE CLEARED: Key '${key}' was deleted.");
    }
};

// --- Make all our tools available to other files ---
export { cacheMiddleware, clearCache };