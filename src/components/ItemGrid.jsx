import { useState, useMemo } from 'react';
import { ItemCard } from './ItemCard';
import './ItemGrid.css';

const ITEM_CATEGORIES = [
    { id: 'all', name: '전체' },
    { id: 'Damage', name: '공격력' },
    { id: 'CriticalStrike', name: '치명타' },
    { id: 'AttackSpeed', name: '공격속도' },
    { id: 'SpellDamage', name: '주문력' },
    { id: 'Armor', name: '방어력' },
    { id: 'SpellBlock', name: '마법저항력' },
    { id: 'Health', name: '체력' },
    { id: 'Boots', name: '신발' },
];

export function ItemGrid({ items, selectedItems, onItemClick }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [showCompleted, setShowCompleted] = useState(true);

    const filteredItems = useMemo(() => {
        if (!items) return [];

        return Object.values(items).filter(item => {
            // Search filter
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                (item.colloq && item.colloq.toLowerCase().includes(search.toLowerCase()));

            // Category filter
            const matchesCategory = category === 'all' ||
                (item.tags && item.tags.includes(category));

            // Completed items filter (items that don't build into anything)
            const isCompleted = !item.into || item.into.length === 0;
            const matchesCompleted = showCompleted ? isCompleted : true;

            return matchesSearch && matchesCategory && matchesCompleted;
        }).sort((a, b) => b.gold.total - a.gold.total);
    }, [items, search, category, showCompleted]);

    return (
        <div className="item-grid-container">
            <div className="filters">
                <input
                    type="text"
                    placeholder="아이템 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />

                <div className="category-filter">
                    {ITEM_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-btn ${category === cat.id ? 'active' : ''}`}
                            onClick={() => setCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <label className="completed-toggle">
                    <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={(e) => setShowCompleted(e.target.checked)}
                    />
                    완성 아이템만
                </label>
            </div>

            <div className="item-grid">
                {filteredItems.map(item => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        onClick={onItemClick}
                    />
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="no-results">검색 결과가 없습니다</div>
            )}
        </div>
    );
}
