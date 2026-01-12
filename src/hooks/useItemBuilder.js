import { useState, useCallback } from 'react';

export function useItemBuilder(allItems) {
    const [selectedItems, setSelectedItems] = useState([]);
    const MAX_ITEMS = 6;

    const addItem = useCallback((itemId) => {
        setSelectedItems(prev => {
            if (prev.length >= MAX_ITEMS) return prev;
            if (prev.includes(itemId)) return prev;
            return [...prev, itemId];
        });
    }, []);

    const removeItem = useCallback((itemId) => {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
    }, []);

    const clearItems = useCallback(() => {
        setSelectedItems([]);
    }, []);

    // Get build tree (sub-components) for an item
    const getBuildTree = useCallback((itemId, items = allItems) => {
        if (!items || !items[itemId]) return null;

        const item = items[itemId];
        const tree = {
            id: itemId,
            item: item,
            children: []
        };

        if (item.from && item.from.length > 0) {
            tree.children = item.from
                .filter(childId => items[childId])
                .map(childId => getBuildTree(childId, items));
        }

        return tree;
    }, [allItems]);

    // Calculate total stats from selected items
    const calculateStats = useCallback(() => {
        if (!allItems) return {};

        const totalStats = {};

        selectedItems.forEach(itemId => {
            const item = allItems[itemId];
            if (item && item.stats) {
                Object.entries(item.stats).forEach(([stat, value]) => {
                    totalStats[stat] = (totalStats[stat] || 0) + value;
                });
            }
        });

        return totalStats;
    }, [selectedItems, allItems]);

    // Calculate total gold cost
    const calculateTotalGold = useCallback(() => {
        if (!allItems) return 0;

        return selectedItems.reduce((total, itemId) => {
            const item = allItems[itemId];
            return total + (item?.gold?.total || 0);
        }, 0);
    }, [selectedItems, allItems]);

    return {
        selectedItems,
        addItem,
        removeItem,
        clearItems,
        getBuildTree,
        calculateStats,
        calculateTotalGold,
        isFull: selectedItems.length >= MAX_ITEMS
    };
}
