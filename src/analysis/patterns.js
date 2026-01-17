/**
 * 패턴 분석 모듈
 * - 홀짝 비율
 * - 고저 비율
 * - 연속번호 패턴
 * - 구간별 분포
 */

import { lottoData, ALL_NUMBERS } from '../data/lotto-data.js';

/**
 * 홀짝 비율 분석
 * @returns {{ odd: number, even: number, distribution: Object }}
 */
export function analyzeOddEven(data = lottoData) {
    let oddTotal = 0;
    let evenTotal = 0;
    const distribution = {}; // '3:3', '4:2' 등의 분포

    data.forEach(draw => {
        let oddCount = 0;
        let evenCount = 0;

        draw.numbers.forEach(num => {
            if (num % 2 === 1) {
                oddCount++;
                oddTotal++;
            } else {
                evenCount++;
                evenTotal++;
            }
        });

        const key = `${oddCount}:${evenCount}`;
        distribution[key] = (distribution[key] || 0) + 1;
    });

    const total = oddTotal + evenTotal;
    return {
        odd: oddTotal,
        even: evenTotal,
        oddPercent: Math.round((oddTotal / total) * 100),
        evenPercent: Math.round((evenTotal / total) * 100),
        distribution
    };
}

/**
 * 고저 비율 분석 (1-22: 저, 23-45: 고)
 */
export function analyzeHighLow(data = lottoData) {
    let lowTotal = 0;
    let highTotal = 0;
    const distribution = {};

    data.forEach(draw => {
        let lowCount = 0;
        let highCount = 0;

        draw.numbers.forEach(num => {
            if (num <= 22) {
                lowCount++;
                lowTotal++;
            } else {
                highCount++;
                highTotal++;
            }
        });

        const key = `${lowCount}:${highCount}`;
        distribution[key] = (distribution[key] || 0) + 1;
    });

    const total = lowTotal + highTotal;
    return {
        low: lowTotal,
        high: highTotal,
        lowPercent: Math.round((lowTotal / total) * 100),
        highPercent: Math.round((highTotal / total) * 100),
        distribution
    };
}

/**
 * 구간별 분포 분석
 * 1-10, 11-20, 21-30, 31-40, 41-45
 */
export function analyzeRangeDistribution(data = lottoData) {
    const ranges = {
        '1-10': 0,
        '11-20': 0,
        '21-30': 0,
        '31-40': 0,
        '41-45': 0
    };

    data.forEach(draw => {
        draw.numbers.forEach(num => {
            if (num <= 10) ranges['1-10']++;
            else if (num <= 20) ranges['11-20']++;
            else if (num <= 30) ranges['21-30']++;
            else if (num <= 40) ranges['31-40']++;
            else ranges['41-45']++;
        });
    });

    // 평균값 계산 (각 구간의 번호 개수 고려)
    const total = data.length * 6;
    const rangeData = Object.entries(ranges).map(([range, count]) => ({
        range,
        count,
        percent: Math.round((count / total) * 100)
    }));

    return rangeData;
}

/**
 * 연속번호 패턴 분석
 */
export function analyzeConsecutive(data = lottoData) {
    const patterns = {
        none: 0,      // 연속번호 없음
        pair: 0,      // 2연속 1쌍
        twoPairs: 0,  // 2연속 2쌍
        triple: 0,    // 3연속
        more: 0       // 4연속 이상
    };

    data.forEach(draw => {
        const sorted = [...draw.numbers].sort((a, b) => a - b);
        let consecutiveCount = 1;
        let maxConsecutive = 1;
        let pairCount = 0;

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] === 1) {
                consecutiveCount++;
                maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
            } else {
                if (consecutiveCount === 2) pairCount++;
                consecutiveCount = 1;
            }
        }
        if (consecutiveCount === 2) pairCount++;

        if (maxConsecutive >= 4) patterns.more++;
        else if (maxConsecutive === 3) patterns.triple++;
        else if (pairCount >= 2) patterns.twoPairs++;
        else if (pairCount === 1) patterns.pair++;
        else patterns.none++;
    });

    return patterns;
}

/**
 * AC값 계산 (번호 조합의 복잡도)
 * AC = 서로 다른 차이값의 개수 - 5
 */
export function calculateAC(numbers) {
    const differences = new Set();
    const sorted = [...numbers].sort((a, b) => a - b);

    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            differences.add(sorted[j] - sorted[i]);
        }
    }

    return differences.size - 5;
}

/**
 * 전체 AC값 분포
 */
export function analyzeACDistribution(data = lottoData) {
    const distribution = {};

    data.forEach(draw => {
        const ac = calculateAC(draw.numbers);
        distribution[ac] = (distribution[ac] || 0) + 1;
    });

    return distribution;
}
