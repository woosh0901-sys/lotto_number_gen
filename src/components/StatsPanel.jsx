import './StatsPanel.css';

const STAT_NAMES = {
    FlatPhysicalDamageMod: { name: '공격력', icon: '⚔️' },
    FlatMagicDamageMod: { name: '주문력', icon: '🔮' },
    FlatArmorMod: { name: '방어력', icon: '🛡️' },
    FlatSpellBlockMod: { name: '마법저항력', icon: '✨' },
    FlatHPPoolMod: { name: '체력', icon: '❤️' },
    FlatMPPoolMod: { name: '마나', icon: '💧' },
    PercentAttackSpeedMod: { name: '공격속도', icon: '⚡', isPercent: true },
    FlatCritChanceMod: { name: '치명타 확률', icon: '💥', isPercent: true },
    PercentMovementSpeedMod: { name: '이동속도', icon: '👟', isPercent: true },
    FlatMovementSpeedMod: { name: '이동속도', icon: '👟' },
    PercentLifeStealMod: { name: '생명력 흡수', icon: '🩸', isPercent: true },
    FlatHPRegenMod: { name: '체력 재생', icon: '💚' },
    FlatMPRegenMod: { name: '마나 재생', icon: '💙' },
};

export function StatsPanel({ stats, totalGold }) {
    const statEntries = Object.entries(stats).filter(([_, value]) => value !== 0);

    if (statEntries.length === 0) {
        return (
            <div className="stats-panel empty">
                <h3>📊 합산 스탯</h3>
                <p>아이템을 선택하면 스탯이 표시됩니다</p>
            </div>
        );
    }

    return (
        <div className="stats-panel">
            <h3>📊 합산 스탯</h3>

            <div className="total-gold">
                <span className="gold-icon">💰</span>
                <span className="gold-value">{totalGold.toLocaleString()}</span>
                <span className="gold-label">총 골드</span>
            </div>

            <div className="stats-list">
                {statEntries.map(([key, value]) => {
                    const statInfo = STAT_NAMES[key] || { name: key, icon: '📈' };
                    const displayValue = statInfo.isPercent
                        ? `+${(value * 100).toFixed(0)}%`
                        : `+${value}`;

                    return (
                        <div key={key} className="stat-row">
                            <span className="stat-icon">{statInfo.icon}</span>
                            <span className="stat-name">{statInfo.name}</span>
                            <span className="stat-value">{displayValue}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
