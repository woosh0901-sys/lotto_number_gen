/**
 * 동행복권 API에서 전체 로또 당첨번호 데이터 수집
 * 
 * 사용법: node scripts/fetch-lotto-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=';
const OUTPUT_PATH = path.join(__dirname, '../src/data/lotto-data.js');

// 딜레이 함수 (서버 부하 방지)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 단일 회차 데이터 가져오기
function fetchRound(round) {
    return new Promise((resolve, reject) => {
        const url = `${API_URL}${round}`;

        https.get(url, (res) => {
            let data = '';

            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.returnValue === 'success') {
                        resolve({
                            round: json.drwNo,
                            date: json.drwNoDate,
                            numbers: [
                                json.drwtNo1,
                                json.drwtNo2,
                                json.drwtNo3,
                                json.drwtNo4,
                                json.drwtNo5,
                                json.drwtNo6
                            ],
                            bonus: json.bnusNo
                        });
                    } else {
                        resolve(null); // 해당 회차 없음
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// 최신 회차 찾기
async function findLatestRound() {
    let round = 1200; // 대략적인 시작점

    // 존재하는 회차까지 증가
    while (true) {
        const data = await fetchRound(round);
        if (data) {
            round += 50;
        } else {
            break;
        }
    }

    // 정확한 마지막 회차 찾기
    round -= 50;
    while (true) {
        const data = await fetchRound(round);
        if (data) {
            round++;
        } else {
            return round - 1;
        }
    }
}

// 전체 데이터 수집
async function fetchAllData() {
    console.log('🎰 로또 데이터 수집 시작...\n');

    // 최신 회차 확인
    console.log('📡 최신 회차 확인 중...');
    const latestRound = await findLatestRound();
    console.log(`✅ 최신 회차: ${latestRound}회\n`);

    const allData = [];
    const batchSize = 10; // 한번에 10개씩 요청

    for (let i = 1; i <= latestRound; i += batchSize) {
        const batch = [];
        const end = Math.min(i + batchSize - 1, latestRound);

        for (let j = i; j <= end; j++) {
            batch.push(fetchRound(j));
        }

        const results = await Promise.all(batch);
        results.forEach(data => {
            if (data) allData.push(data);
        });

        // 진행률 표시
        const progress = Math.round((end / latestRound) * 100);
        process.stdout.write(`\r📥 수집 중... ${end}/${latestRound} (${progress}%)`);

        // 서버 부하 방지를 위한 딜레이
        await delay(100);
    }

    console.log('\n\n✅ 데이터 수집 완료!');
    console.log(`📊 총 ${allData.length}개 회차 데이터 수집됨\n`);

    return allData;
}

// 파일로 저장
function saveToFile(data) {
    const fileContent = `/**
 * 로또 역대 당첨번호 데이터
 * 1회(2002.12.07) ~ ${data[data.length - 1].round}회(${data[data.length - 1].date})
 * 
 * 자동 생성됨: ${new Date().toISOString()}
 * 총 ${data.length}개 회차
 */

export const lottoData = ${JSON.stringify(data, null, 2)};

/**
 * 전체 번호 (1~45)
 */
export const ALL_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

/**
 * 번호 범위별 색상 클래스 반환
 */
export function getBallColorClass(num) {
  if (num <= 10) return 'range-1';  // Yellow
  if (num <= 20) return 'range-2';  // Blue
  if (num <= 30) return 'range-3';  // Red
  if (num <= 40) return 'range-4';  // Gray
  return 'range-5';                 // Green
}

/**
 * 최신 회차 정보
 */
export function getLatestRound() {
  return lottoData[lottoData.length - 1];
}

/**
 * 총 회차 수
 */
export function getTotalRounds() {
  return lottoData.length;
}

/**
 * 데이터 기간 문자열
 */
export function getDataRange() {
  const first = lottoData[0];
  const last = lottoData[lottoData.length - 1];
  return \`\${first.date.slice(0, 7)} ~ \${last.date.slice(0, 7)}\`;
}
`;

    fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf8');
    console.log(`💾 파일 저장 완료: ${OUTPUT_PATH}`);
}

// 메인 실행
async function main() {
    try {
        const data = await fetchAllData();
        saveToFile(data);
        console.log('\n🎉 완료! 브라우저를 새로고침하세요.');
    } catch (error) {
        console.error('❌ 에러 발생:', error.message);
        process.exit(1);
    }
}

main();
