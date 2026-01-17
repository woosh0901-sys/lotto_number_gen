/**
 * 기간별/시계열 분석 모듈
 * - 주차별 트렌드
 * - 월별 분석
 * - 최근 N회 핫넘버
 */

import { lottoData, ALL_NUMBERS } from '../data/lotto-data.js';
import { calculateFrequency, getHotNumbers, getColdNumbers } from './frequency.js';

/**
 * 최근 N회차 데이터 필터링
 */
export function getRecentDraws(n = 10, data = lottoData) {
    return data.slice(-n);
}

/**
 * 최근 N주간 핫넘버
 */
export function getRecentHotNumbers(weeks = 4, topN = 6) {
    const recentData = getRecentDraws(weeks);
    return getHotNumbers(topN, recentData);
}

/**
 * 최근 N주간 콜드넘버 (안 나온 번호)
 */
export function getRecentColdNumbers(weeks = 10) {
    const recentData = getRecentDraws(weeks);
    const appearedNumbers = new Set();

    recentData.forEach(draw => {
        draw.numbers.forEach(num => appearedNumbers.add(num));
    });

    // 나오지 않은 번호들
    const coldNumbers = ALL_NUMBERS.filter(num => !appearedNumbers.has(num));
    return coldNumbers;
}

/**
 * 미출현 기간 계산 (각 번호가 마지막으로 나온 후 몇 회차가 지났는지)
 */
export function getAbsencePeriod(data = lottoData) {
    const lastAppearance = new Map();
    const latestRound = data[data.length - 1].round;

    // 초기화 (한번도 안 나온 것처럼)
    ALL_NUMBERS.forEach(num => lastAppearance.set(num, 0));

    // 마지막 출현 회차 기록
    data.forEach(draw => {
        draw.numbers.forEach(num => {
            lastAppearance.set(num, draw.round);
        });
    });

    // 미출현 기간 계산
    const absencePeriod = [];
    ALL_NUMBERS.forEach(num => {
        const lastRound = lastAppearance.get(num);
        absencePeriod.push({
            number: num,
            lastRound,
            absence: latestRound - lastRound
        });
    });

    // 미출현 기간이 긴 순서로 정렬
    return absencePeriod.sort((a, b) => b.absence - a.absence);
}

/**
 * 월별 출현 빈도 분석
 */
export function analyzeByMonth(data = lottoData) {
    const monthlyData = {};

    data.forEach(draw => {
        const month = draw.date.slice(0, 7); // 'YYYY-MM'

        if (!monthlyData[month]) {
            monthlyData[month] = {
                draws: [],
                frequency: new Map()
            };
            ALL_NUMBERS.forEach(num => monthlyData[month].frequency.set(num, 0));
        }

        monthlyData[month].draws.push(draw);
        draw.numbers.forEach(num => {
            const curr = monthlyData[month].frequency.get(num);
            monthlyData[month].frequency.set(num, curr + 1);
        });
    });

    return monthlyData;
}

/**
 * 연도별 핫넘버 추출
 */
export function getYearlyHotNumbers(data = lottoData) {
    const yearlyData = {};

    data.forEach(draw => {
        const year = draw.date.slice(0, 4);

        if (!yearlyData[year]) {
            yearlyData[year] = [];
        }
        yearlyData[year].push(draw);
    });

    const result = {};
    Object.entries(yearlyData).forEach(([year, draws]) => {
        result[year] = getHotNumbers(6, draws);
    });

    return result;
}

/**
 * 트렌드 분석 (최근 vs 전체 비교)
 */
export function analyzeTrend(recentWeeks = 12, data = lottoData) {
    const allFreq = calculateFrequency(data);
    const recentFreq = calculateFrequency(getRecentDraws(recentWeeks, data));

    const totalDraws = data.length;
    const recentDraws = Math.min(recentWeeks, data.length);

    const trend = [];

    ALL_NUMBERS.forEach(num => {
        const allAvg = allFreq.get(num) / totalDraws;
        const recentAvg = recentFreq.get(num) / recentDraws;
        const diff = recentAvg - allAvg;

        trend.push({
            number: num,
            allFreq: allFreq.get(num),
            recentFreq: recentFreq.get(num),
            trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
            trendValue: diff
        });
    });

    return trend.sort((a, b) => b.trendValue - a.trendValue);
}
