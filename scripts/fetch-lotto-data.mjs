/**
 * GitHub API에서 전체 로또 당첨번호 데이터 수집
 * 
 * 사용법: node scripts/fetch-lotto-data.mjs
 * 
 * 데이터 출처: https://github.com/smok95/lotto
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://smok95.github.io/lotto/results/all.json';
const OUTPUT_PATH = path.join(__dirname, '../src/data/lotto-data.js');

// 전체 데이터 가져오기
function fetchAllData() {
    return new Promise((resolve, reject) => {
        console.log('🎰 전체 로또 데이터 수집 시작...\n');
        console.log(`📡 데이터 소스: ${API_URL}\n`);

        https.get(API_URL, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
                process.stdout.write(`\r📥 다운로드 중... ${(data.length / 1024).toFixed(1)} KB`);
            });

            res.on('end', () => {
                try {
                    console.log('\n');
                    const json = JSON.parse(data);

                    // 데이터 형식 변환
                    const formattedData = json.map(item => ({
                        round: item.draw_no,
                        date: item.date.slice(0, 10), // 'YYYY-MM-DD'
                        numbers: item.numbers,
                        bonus: item.bonus_no
                    }));

                    // 회차 순으로 정렬
                    formattedData.sort((a, b) => a.round - b.round);

                    console.log(`✅ 데이터 수집 완료!`);
                    console.log(`📊 총 ${formattedData.length}개 회차 데이터`);
                    console.log(`📅 범위: ${formattedData[0].round}회 ~ ${formattedData[formattedData.length - 1].round}회\n`);

                    resolve(formattedData);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// 파일로 저장
function saveToFile(data) {
    const fileContent = `/**
 * 로또 역대 당첨번호 데이터
 * ${data[0].round}회(${data[0].date}) ~ ${data[data.length - 1].round}회(${data[data.length - 1].date})
 * 
 * 자동 생성됨: ${new Date().toISOString()}
 * 총 ${data.length}개 회차
 * 
 * 데이터 출처: https://github.com/smok95/lotto
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
