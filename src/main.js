/**
 * 로또 통계 분석기 - 메인 애플리케이션
 */

import './styles/main.css';
import Chart from 'chart.js/auto';

import { lottoData, getBallColorClass, getLatestRound, getTotalRounds, getDataRange } from './data/lotto-data.js';
import { calculateFrequency, getHotNumbers, getColdNumbers, getFrequencyStats } from './analysis/frequency.js';
import { analyzeOddEven, analyzeHighLow, analyzeRangeDistribution, analyzeConsecutive } from './analysis/patterns.js';
import { getRecentHotNumbers, getAbsencePeriod } from './analysis/timeline.js';
import { generateRecommendation } from './analysis/recommendation.js';
import { checkForNewData, removeDuplicates } from './data/data-service.js';

// ===== 글로벌 상태 =====
let currentRecommendationType = 'frequency';
let charts = {};
let currentData = removeDuplicates(lottoData); // 중복 제거된 데이터 사용

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    // 먼저 기존 데이터로 렌더링
    renderStatsOverview();
    renderRecentDraws();
    renderFrequencyChart();
    renderOddEvenChart();
    renderHighLowChart();
    renderRangeChart();
    renderHotNumbers(4);
    renderColdNumbers();
    renderConsecutivePatterns();
    renderRecommendation();

    setupEventListeners();

    // 백그라운드에서 최신 데이터 확인 (비동기)
    checkAndUpdateData();
}

// ===== 백그라운드 데이터 업데이트 체크 =====
async function checkAndUpdateData() {
    const currentLatest = currentData[currentData.length - 1]?.round || 0;
    const newData = await checkForNewData(currentLatest);

    if (newData) {
        // 새 데이터가 있으면 알림 표시
        showUpdateNotification(newData.round);
        currentData.push(newData);
        renderRecentDraws();
        renderStatsOverview();
    }
}

// ===== 업데이트 알림 =====
function showUpdateNotification(newRound) {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <span>🎉 ${newRound}회 당첨번호가 업데이트되었습니다!</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.prepend(notification);

    // 5초 후 자동 제거
    setTimeout(() => notification.remove(), 5000);
}

// ===== 최근 10회 당첨번호 =====
function renderRecentDraws() {
    const recentDraws = currentData.slice(-10).reverse(); // 중복 제거된 데이터에서 최신 10개
    const container = document.getElementById('recentDraws');

    container.innerHTML = recentDraws.map(draw => {
        const numbersHtml = draw.numbers.map(num =>
            `<div class="lotto-ball ${getBallColorClass(num)}">${num}</div>`
        ).join('');

        const bonusHtml = `<div class="lotto-ball bonus-ball ${getBallColorClass(draw.bonus)}">${draw.bonus}</div>`;

        return `
            <div class="draw-row">
                <span class="draw-round">${draw.round}회</span>
                <span class="draw-date">${draw.date}</span>
                <div class="draw-numbers">
                    ${numbersHtml}
                    <span class="bonus-separator">+</span>
                    ${bonusHtml}
                </div>
            </div>
        `;
    }).join('');
}

// ===== 통계 개요 =====
function renderStatsOverview() {
    const latest = getLatestRound();

    document.getElementById('totalDraws').textContent = getTotalRounds().toLocaleString();
    document.getElementById('latestDraw').textContent = `${latest.round}회`;
    document.getElementById('dataRange').textContent = getDataRange();
}

// ===== 번호별 출현 빈도 차트 =====
function renderFrequencyChart() {
    const frequency = calculateFrequency();
    const labels = Array.from({ length: 45 }, (_, i) => i + 1);
    const data = labels.map(num => frequency.get(num));
    const stats = getFrequencyStats();

    // 색상 배열 생성
    const colors = labels.map(num => {
        if (num <= 10) return 'rgba(251, 191, 36, 0.8)';      // Yellow
        if (num <= 20) return 'rgba(59, 130, 246, 0.8)';      // Blue
        if (num <= 30) return 'rgba(239, 68, 68, 0.8)';       // Red
        if (num <= 40) return 'rgba(107, 114, 128, 0.8)';     // Gray
        return 'rgba(16, 185, 129, 0.8)';                      // Green
    });

    const ctx = document.getElementById('frequencyChart').getContext('2d');

    charts.frequency = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '출현 횟수',
                data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: (context) => {
                            const avg = stats.avg;
                            const diff = context.raw - avg;
                            return diff > 0 ? `평균 대비 +${diff}회` : `평균 대비 ${diff}회`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#a0a0b0' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0b0', maxRotation: 0 }
                }
            }
        }
    });
}

// ===== 홀짝 비율 차트 =====
function renderOddEvenChart() {
    const { oddPercent, evenPercent } = analyzeOddEven();

    const ctx = document.getElementById('oddEvenChart').getContext('2d');

    charts.oddEven = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['홀수', '짝수'],
            datasets: [{
                data: [oddPercent, evenPercent],
                backgroundColor: ['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)'],
                borderColor: ['#667eea', '#764ba2'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a0a0b0', padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw}%`
                    }
                }
            }
        }
    });
}

// ===== 고저 비율 차트 =====
function renderHighLowChart() {
    const { lowPercent, highPercent } = analyzeHighLow();

    const ctx = document.getElementById('highLowChart').getContext('2d');

    charts.highLow = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['저 (1-22)', '고 (23-45)'],
            datasets: [{
                data: [lowPercent, highPercent],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                borderColor: ['#10b981', '#ef4444'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a0a0b0', padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw}%`
                    }
                }
            }
        }
    });
}

// ===== 구간별 분포 차트 =====
function renderRangeChart() {
    const rangeData = analyzeRangeDistribution();

    const ctx = document.getElementById('rangeChart').getContext('2d');

    charts.range = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rangeData.map(r => r.range),
            datasets: [{
                label: '출현 비율 (%)',
                data: rangeData.map(r => r.percent),
                backgroundColor: [
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 30,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#a0a0b0',
                        callback: (value) => `${value}%`
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0b0' }
                }
            }
        }
    });
}

// ===== 최근 핫넘버 =====
function renderHotNumbers(weeks = 4) {
    const hotNumbers = getRecentHotNumbers(weeks, 10);
    const container = document.getElementById('hotNumbers');

    container.innerHTML = hotNumbers.map(([num, count]) => `
    <div class="lotto-ball small ${getBallColorClass(num)}" title="${count}회 출현">
      ${num}
    </div>
  `).join('');
}

// ===== 미출현 번호 =====
function renderColdNumbers() {
    const absencePeriod = getAbsencePeriod().slice(0, 10);
    const container = document.getElementById('coldNumbers');

    container.innerHTML = absencePeriod.map(({ number, absence }) => `
    <div class="lotto-ball small ${getBallColorClass(number)}" title="${absence}회 미출현">
      ${number}
    </div>
  `).join('');
}

// ===== 연속번호 패턴 =====
function renderConsecutivePatterns() {
    const patterns = analyzeConsecutive();
    const total = Object.values(patterns).reduce((a, b) => a + b, 0);
    const container = document.getElementById('consecutivePatterns');

    const patternLabels = {
        none: '연속 없음',
        pair: '2연속 1쌍',
        twoPairs: '2연속 2쌍',
        triple: '3연속',
        more: '4연속+'
    };

    container.innerHTML = Object.entries(patterns).map(([key, count]) => {
        const percent = Math.round((count / total) * 100);
        return `
      <div class="pattern-item">
        <div class="pattern-value">${percent}%</div>
        <div class="pattern-label">${patternLabels[key]}</div>
      </div>
    `;
    }).join('');
}

// ===== 추천 번호 =====
function renderRecommendation() {
    const numbers = generateRecommendation(currentRecommendationType);
    const container = document.getElementById('recommendedNumbers');

    container.innerHTML = numbers.map((num, i) => `
    <div class="lotto-ball ${getBallColorClass(num)}" style="animation-delay: ${i * 0.1}s">
      ${num}
    </div>
  `).join('');
}

// ===== 이벤트 리스너 =====
function setupEventListeners() {
    // 추천 타입 버튼
    document.querySelectorAll('.rec-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.rec-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentRecommendationType = e.target.dataset.type;
            renderRecommendation();
        });
    });

    // 새 번호 생성 버튼
    document.getElementById('generateBtn').addEventListener('click', () => {
        renderRecommendation();
    });

    // 타임라인 주차 버튼
    document.querySelectorAll('.timeline-controls .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.timeline-controls .btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const weeks = parseInt(e.target.dataset.weeks);
            renderHotNumbers(weeks);
        });
    });

    // 테마 토글 버튼
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // 저장된 테마 불러오기
        const savedTheme = localStorage.getItem('lotto-theme') || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                themeToggle.textContent = '🌙';
                localStorage.setItem('lotto-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '☀️';
                localStorage.setItem('lotto-theme', 'dark');
            }
        });
    }

    // 복권 판매점 찾기 버튼
    const findStoreBtn = document.getElementById('findStoreBtn');
    if (findStoreBtn) {
        findStoreBtn.addEventListener('click', findNearbyStores);
    }

    // 주소 입력창 엔터키 지원
    const addressInput = document.getElementById('addressInput');
    if (addressInput) {
        addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                findNearbyStores();
            }
        });
    }
}

// ===== 근처 복권 판매점 찾기 =====
// ===== 복권 판매점 검색 (네이버 지도 연동) =====
function findNearbyStores() {
    const input = document.getElementById('addressInput');
    const query = input.value.trim();

    if (!query) {
        alert('지역명을 입력해주세요! (예: 강남구, 역삼동)');
        input.focus();
        return;
    }

    // 네이버 지도 검색 URL 생성
    const searchUrl = `https://map.naver.com/p/search/${encodeURIComponent(query + ' 복권 판매점')}`;

    // 새 창으로 열기
    window.open(searchUrl, '_blank');
}

// 지도 이동 함수 (전역)
window.panToStore = function (lat, lng) {
    if (storeMap) {
        storeMap.panTo(new kakao.maps.LatLng(lat, lng));
    }
};
