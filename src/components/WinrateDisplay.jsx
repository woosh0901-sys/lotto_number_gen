import { getMatchingBuild, estimateWinrate } from '../data/winrateData';
import './WinrateDisplay.css';

export function WinrateDisplay({ selectedItems, allItems }) {
    const matchingBuild = getMatchingBuild(selectedItems);
    const estimatedWinrate = estimateWinrate(selectedItems, allItems);

    if (!selectedItems.length) {
        return (
            <div className="winrate-display empty">
                <h3>📈 승률 분석</h3>
                <p>아이템을 선택하면 승률이 표시됩니다</p>
            </div>
        );
    }

    return (
        <div className="winrate-display">
            <h3>📈 승률 분석</h3>

            {matchingBuild && (
                <div className="matching-build">
                    <div className="build-header">
                        <span className="build-name">{matchingBuild.name}</span>
                        <span className="build-role">{matchingBuild.role}</span>
                    </div>
                    <div className="build-stats">
                        <div className="stat">
                            <span className="stat-label">승률</span>
                            <span className={`stat-value ${matchingBuild.winrate >= 50 ? 'positive' : 'negative'}`}>
                                {matchingBuild.winrate}%
                            </span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">픽률</span>
                            <span className="stat-value">{matchingBuild.pickrate}%</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">일치도</span>
                            <span className="stat-value">{matchingBuild.matchPercent}%</span>
                        </div>
                    </div>
                </div>
            )}

            {!matchingBuild && estimatedWinrate && (
                <div className="estimated-winrate">
                    <div className="winrate-circle">
                        <svg viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(200, 155, 60, 0.2)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={estimatedWinrate >= 50 ? '#0ac8b9' : '#e84057'}
                                strokeWidth="8"
                                strokeDasharray={`${estimatedWinrate * 2.83} 283`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="winrate-value">
                            <span className="number">{estimatedWinrate.toFixed(1)}</span>
                            <span className="percent">%</span>
                        </div>
                    </div>
                    <p className="estimate-label">예상 승률</p>
                    <p className="estimate-note">* 아이템 시너지 기반 추정치</p>
                </div>
            )}
        </div>
    );
}
