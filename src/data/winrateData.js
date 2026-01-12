// Sample winrate data for popular item builds
// Note: Real winrate data would require match history analysis or external APIs

export const popularBuilds = [
    {
        name: "Assassin Burst",
        items: ["3157", "3089", "3135", "3020", "3165", "3116"],
        winrate: 52.4,
        pickrate: 8.2,
        role: "Mid"
    },
    {
        name: "ADC Critical",
        items: ["3031", "3094", "3006", "3036", "3072", "3046"],
        winrate: 51.8,
        pickrate: 12.5,
        role: "Bot"
    },
    {
        name: "Tank Engage",
        items: ["3068", "3075", "3143", "3065", "3047", "3742"],
        winrate: 53.1,
        pickrate: 9.8,
        role: "Top"
    },
    {
        name: "Bruiser Fighter",
        items: ["6630", "3071", "3053", "3111", "3026", "3748"],
        winrate: 50.9,
        pickrate: 7.4,
        role: "Top"
    },
    {
        name: "Mage Control",
        items: ["6655", "3003", "3089", "3157", "3020", "3102"],
        winrate: 51.2,
        pickrate: 6.1,
        role: "Mid"
    },
    {
        name: "Support Utility",
        items: ["3504", "3011", "3158", "3222", "3190", "3107"],
        winrate: 52.8,
        pickrate: 5.3,
        role: "Support"
    }
];

// Get matching build and winrate for selected items
export function getMatchingBuild(selectedItems) {
    if (selectedItems.length < 2) return null;

    let bestMatch = null;
    let maxMatches = 0;

    popularBuilds.forEach(build => {
        const matches = selectedItems.filter(id => build.items.includes(id)).length;
        const matchPercent = matches / selectedItems.length;

        if (matches >= 2 && matchPercent >= 0.5 && matches > maxMatches) {
            maxMatches = matches;
            bestMatch = {
                ...build,
                matchCount: matches,
                matchPercent: Math.round(matchPercent * 100)
            };
        }
    });

    return bestMatch;
}

// Estimate winrate based on item synergy
export function estimateWinrate(selectedItems, allItems) {
    if (!selectedItems.length || !allItems) return null;

    // Base winrate
    let winrate = 50;

    // Check for synergistic item combinations
    const itemTags = selectedItems
        .map(id => allItems[id]?.tags || [])
        .flat();

    // Bonus for focused builds
    const tagCounts = {};
    itemTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    const maxTagCount = Math.max(...Object.values(tagCounts), 0);
    if (maxTagCount >= 3) {
        winrate += (maxTagCount - 2) * 0.5;
    }

    // Penalty for too many boots
    const bootItems = selectedItems.filter(id =>
        allItems[id]?.tags?.includes('Boots')
    );
    if (bootItems.length > 1) {
        winrate -= 5;
    }

    return Math.min(Math.max(winrate, 40), 60);
}
