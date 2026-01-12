// Riot Data Dragon API with Rate Limiting
// Rate Limits: 20 req/sec, 100 req/2min

const CACHE_KEY = 'lol_items_cache';
const CACHE_VERSION_KEY = 'lol_items_version';

class RateLimiter {
    constructor() {
        this.requests = [];
        this.queue = [];
        this.processing = false;
    }

    async throttle() {
        const now = Date.now();

        // Remove requests older than 2 minutes
        this.requests = this.requests.filter(time => now - time < 120000);

        // Check 2-minute limit (100 requests)
        if (this.requests.length >= 100) {
            const oldestRequest = this.requests[0];
            const waitTime = 120000 - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Check 1-second limit (20 requests)
        const recentRequests = this.requests.filter(time => now - time < 1000);
        if (recentRequests.length >= 20) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.requests.push(Date.now());
    }
}

const rateLimiter = new RateLimiter();

export async function getLatestVersion() {
    const cached = localStorage.getItem(CACHE_VERSION_KEY);
    const cacheTime = localStorage.getItem(CACHE_VERSION_KEY + '_time');

    // Cache version for 1 hour
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 3600000) {
        return cached;
    }

    await rateLimiter.throttle();
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    const latestVersion = versions[0];

    localStorage.setItem(CACHE_VERSION_KEY, latestVersion);
    localStorage.setItem(CACHE_VERSION_KEY + '_time', Date.now().toString());

    return latestVersion;
}

export async function getItems(locale = 'ko_KR') {
    const version = await getLatestVersion();
    const cacheKey = `${CACHE_KEY}_${version}_${locale}`;

    // Check cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    await rateLimiter.throttle();
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/item.json`;
    const response = await fetch(url);
    const data = await response.json();

    // Filter only Summoner's Rift items (map 11)
    const filteredItems = {};
    for (const [id, item] of Object.entries(data.data)) {
        if (item.maps && item.maps['11'] && item.gold.purchasable) {
            filteredItems[id] = {
                ...item,
                id,
                version
            };
        }
    }

    // Cache the data
    localStorage.setItem(cacheKey, JSON.stringify(filteredItems));

    return filteredItems;
}

export function getItemImageUrl(imageName, version) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${imageName}`;
}

export function clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('lol_items')) {
            localStorage.removeItem(key);
        }
    });
}
