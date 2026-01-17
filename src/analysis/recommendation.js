/**
 * 번호 추천 알고리즘 모듈
 */

import { ALL_NUMBERS } from '../data/lotto-data.js';
import { getHotNumbers, getColdNumbers, calculateFrequency } from './frequency.js';
import { analyzeOddEven, analyzeHighLow } from './patterns.js';
import { getAbsencePeriod } from './timeline.js';

/**
 * 빈도 기반 추천
 * 가장 많이 나온 번호들 중에서 선택
 */
export function recommendByFrequency() {
    const hotNumbers = getHotNumbers(15);
    const selected = [];
    const pool = hotNumbers.map(([num]) => num);

    // 핫넘버 풀에서 6개 랜덤 선택
    while (selected.length < 6 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return selected.sort((a, b) => a - b);
}

/**
 * 밸런스 기반 추천
 * 홀짝 3:3, 고저 균형, 구간별 분포 고려
 */
export function recommendBalanced() {
    const selected = [];
    const ranges = [
        [1, 10],
        [11, 20],
        [21, 30],
        [31, 40],
        [41, 45]
    ];

    // 각 구간에서 최소 1개 선택 (마지막 구간은 5개뿐이므로 확률 조정)
    const rangeWeights = [1.2, 1.2, 1.2, 1.2, 0.6]; // 가중치

    // 구간별로 랜덤 선택
    while (selected.length < 6) {
        const rangeIdx = weightedRandom(rangeWeights);
        const [min, max] = ranges[rangeIdx];
        const num = Math.floor(Math.random() * (max - min + 1)) + min;

        if (!selected.includes(num)) {
            selected.push(num);
        }
    }

    // 홀짝 체크 및 조정
    const oddCount = selected.filter(n => n % 2 === 1).length;
    if (oddCount < 2 || oddCount > 4) {
        // 밸런스가 너무 안 맞으면 재생성
        return recommendBalanced();
    }

    return selected.sort((a, b) => a - b);
}

/**
 * 미출현 번호 포함 추천
 * 오랫동안 안 나온 번호들을 포함
 */
export function recommendWithCold() {
    const absencePeriod = getAbsencePeriod();
    const selected = [];

    // 미출현 기간이 긴 상위 3개
    const coldPool = absencePeriod.slice(0, 10).map(item => item.number);

    // 콜드 넘버에서 2~3개 선택
    const coldCount = Math.floor(Math.random() * 2) + 2; // 2~3개
    while (selected.length < coldCount && coldPool.length > 0) {
        const idx = Math.floor(Math.random() * coldPool.length);
        selected.push(coldPool[idx]);
        coldPool.splice(idx, 1);
    }

    // 나머지는 핫넘버에서 채움
    const hotNumbers = getHotNumbers(15).map(([num]) => num);
    while (selected.length < 6) {
        const idx = Math.floor(Math.random() * hotNumbers.length);
        const num = hotNumbers[idx];
        if (!selected.includes(num)) {
            selected.push(num);
        }
        hotNumbers.splice(idx, 1);
    }

    return selected.sort((a, b) => a - b);
}

/**
 * 완전 랜덤 추천
 */
export function recommendRandom() {
    const pool = [...ALL_NUMBERS];
    const selected = [];

    while (selected.length < 6) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return selected.sort((a, b) => a - b);
}

/**
 * 추천 타입에 따른 번호 생성
 */
export function generateRecommendation(type = 'frequency') {
    switch (type) {
        case 'frequency':
            return recommendByFrequency();
        case 'balanced':
            return recommendBalanced();
        case 'cold':
            return recommendWithCold();
        case 'random':
        default:
            return recommendRandom();
    }
}

/**
 * 가중치 기반 랜덤 인덱스 선택
 */
function weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) return i;
    }

    return weights.length - 1;
}
