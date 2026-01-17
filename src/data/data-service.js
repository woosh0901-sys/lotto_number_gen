/**
 * 로또 데이터 자동 업데이트 서비스
 * 페이지 로드 시 GitHub에서 최신 데이터 확인
 */

const GITHUB_API_URL = 'https://smok95.github.io/lotto/results/latest.json';
const ALL_DATA_URL = 'https://smok95.github.io/lotto/results/all.json';

/**
 * 최신 회차 정보만 가져오기
 */
export async function fetchLatestRound() {
    try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        return {
            round: data.draw_no,
            date: data.date.slice(0, 10),
            numbers: data.numbers,
            bonus: data.bonus_no
        };
    } catch (error) {
        console.warn('최신 데이터 가져오기 실패:', error.message);
        return null;
    }
}

/**
 * 전체 데이터 가져오기 (GitHub에서)
 */
export async function fetchAllData() {
    try {
        const response = await fetch(ALL_DATA_URL);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        // 데이터 형식 변환 및 중복 제거
        const formattedData = data.map(item => ({
            round: item.draw_no,
            date: item.date.slice(0, 10),
            numbers: item.numbers,
            bonus: item.bonus_no
        }));

        // 회차 기준으로 중복 제거 (Set으로 unique round만 유지)
        const uniqueRounds = new Map();
        formattedData.forEach(item => {
            if (!uniqueRounds.has(item.round)) {
                uniqueRounds.set(item.round, item);
            }
        });

        // 회차 순으로 정렬
        const uniqueData = [...uniqueRounds.values()].sort((a, b) => a.round - b.round);

        return uniqueData;
    } catch (error) {
        console.warn('전체 데이터 가져오기 실패:', error.message);
        return null;
    }
}

/**
 * 새 회차가 있는지 확인
 */
export async function checkForNewData(currentLatestRound) {
    const latest = await fetchLatestRound();
    if (latest && latest.round > currentLatestRound) {
        return latest;
    }
    return null;
}

/**
 * 데이터 중복 제거 유틸리티
 */
export function removeDuplicates(data) {
    const uniqueRounds = new Map();
    data.forEach(item => {
        if (!uniqueRounds.has(item.round)) {
            uniqueRounds.set(item.round, item);
        }
    });
    return [...uniqueRounds.values()].sort((a, b) => a.round - b.round);
}
