import Bottleneck from 'bottleneck';

// Create a rate limiter for HotCRP API calls
// 100 calls per minute = 1 call every 600ms
// Maximum 10 concurrent requests
export const apiLimiter = new Bottleneck({
    reservoir: 100,           // Initial number of jobs that can be executed
    reservoirRefreshAmount: 100, // Number of jobs to add back every reservoirRefreshInterval
    reservoirRefreshInterval: 60 * 1000, // Refresh every 60 seconds (1 minute)
    
    maxConcurrent: 10,        // Maximum number of concurrent requests
    minTime: 600,             // Minimum time between requests (600ms = 100 requests per minute)
    
    // Retry configuration
    retryCount: 3,
    retryDelayMultiplier: 2,
    retryJitter: 'full'
});

// Wrapper function for API calls with rate limiting
export async function rateLimitedApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    return apiLimiter.schedule(apiCall);
}

// Event listeners for monitoring
apiLimiter.on('failed', async (error, jobInfo) => {
    console.warn(`API call failed: ${error.message}. Retrying in ${jobInfo.retryCount} attempts...`);
});

apiLimiter.on('retry', (error, jobInfo) => {
    console.log(`Retrying API call (attempt ${jobInfo.retryCount + 1}/${jobInfo.options.retryCount + 1})`);
});

apiLimiter.on('depleted', (empty) => {
    if (empty) {
        console.log('Rate limiter reservoir depleted. Waiting for refresh...');
    }
});

apiLimiter.on('debug', (message, data) => {
    // Uncomment for detailed debugging
    // console.log('Rate limiter debug:', message, data);
});

export default apiLimiter;
