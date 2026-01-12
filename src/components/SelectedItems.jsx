import { getItemImageUrl } from '../hooks/useRiotApi';
import './SelectedItems.css';

export function SelectedItems({ selectedItems, allItems, onRemove, onClear }) {
    const slots = Array(6).fill(null);
    selectedItems.forEach((id, index) => {
        slots[index] = allItems?.[id] || null;
    });

    return (
        <div className="selected-items-container">
            <div className="selected-header">
                <h3>🎯 선택한 아이템</h3>
                {selectedItems.length > 0 && (
                    <button className="clear-btn" onClick={onClear}>
                        초기화
                    </button>
                )}
            </div>

            <div className="item-slots">
                {slots.map((item, index) => (
                    <div
                        key={index}
                        className={`item-slot ${item ? 'filled' : 'empty'}`}
                        onClick={() => item && onRemove(item.id)}
                    >
                        {item ? (
                            <>
                                <img
                                    src={getItemImageUrl(item.image.full, item.version)}
                                    alt={item.name}
                                    title={item.name}
                                />
                                <div className="remove-badge">×</div>
                            </>
                        ) : (
                            <span className="slot-number">{index + 1}</span>
                        )}
                    </div>
                ))}
            </div>

            {selectedItems.length === 0 && (
                <p className="hint">아래 목록에서 아이템을 클릭하여 추가하세요</p>
            )}
        </div>
    );
}
