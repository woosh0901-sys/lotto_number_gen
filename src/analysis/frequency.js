/**
 * 번호별 출현 빈도 분석 모듈
 */

import { lottoData, ALL_NUMBERS } from '../data/lotto-data.js';

/**
 * 전체 번호별 출현 빈도 계산
 * @returns {Map<number, number>} 번호별 출현 횟수
 */
export function calculateFrequency(data = lottoData) {
    const frequency = new Map();

    // 초기화
    ALL_NUMBERS.forEach(num => frequency.set(num, 0));

    // 카운트
    data.forEach(draw => {
        draw.numbers.forEach(num => {
            frequency.set(num, frequency.get(num) + 1);
        });
    });

    return frequency;
}

/**
 * 보너스 번호 포함 빈도 계산
 */
export function calculateFrequencyWithBonus(data = lottoData) {
    const frequency = new Map();

    ALL_NUMBERS.forEach(num => frequency.set(num, 0));

    data.forEach(draw => {
        draw.numbers.forEach(num => {
            frequency.set(num, frequency.get(num) + 1);
        });
        frequency.set(draw.bonus, frequency.get(draw.bonus) + 1);
    });

    return frequency;
}

/**
 * 빈도순 정렬된 번호 배열 반환
 * @param {boolean} ascending - true면 오름차순 (적게 나온 순)
 */
export function getSortedByFrequency(ascending = false, data = lottoData) {
    const frequency = calculateFrequency(data);
    const sorted = [...frequency.entries()].sort((a, b) =>
        ascending ? a[1] - b[1] : b[1] - a[1]
    );
    return sorted;
}

/**
 * 최다 출현 번호 Top N
 */
export function getHotNumbers(n = 10, data = lottoData) {
    return getSortedByFrequency(false, data).slice(0, n);
}

/**
 * 최소 출현 번호 Top N
 */
export function getColdNumbers(n = 10, data = lottoData) {
    return getSortedByFrequency(true, data).slice(0, n);
}

/**
 * 평균 출현 횟수
 */
export function getAverageFrequency(data = lottoData) {
    const frequency = calculateFrequency(data);
    const total = [...frequency.values()].reduce((a, b) => a + b, 0);
    return total / 45;
}

/**
 * 출현 빈도 통계 요약
 */
export function getFrequencyStats(data = lottoData) {
    const frequency = calculateFrequency(data);
    const values = [...frequency.values()];
    const sorted = values.sort((a, b) => a - b);

    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: Math.round(values.reduce((a, b) => a + b, 0) / 45),
        median: sorted[22]
    };
}
