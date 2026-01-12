import { getItemImageUrl } from '../hooks/useRiotApi';
import './ItemCard.css';

export function ItemCard({ item, onClick, isSelected, size = 'normal' }) {
    const imageUrl = getItemImageUrl(item.image.full, item.version);

    return (
        <div
            className={`item-card ${isSelected ? 'selected' : ''} size-${size}`}
            onClick={() => onClick(item.id)}
            title={item.name}
        >
            <img
                src={imageUrl}
                alt={item.name}
                loading="lazy"
            />
            {size !== 'small' && (
                <div className="item-overlay">
                    <span className="item-gold">{item.gold.total}g</span>
                </div>
            )}
            {isSelected && <div className="selected-badge">✓</div>}
        </div>
    );
}
