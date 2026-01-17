# 🎰 로또 통계 분석기 (Lotto Analyzer)

> **Google DeepMind Antigravity**로 만든 로또 당첨번호 통계 분석 웹 애플리케이션

[![Made with Antigravity](https://img.shields.io/badge/Made%20with-Antigravity-blueviolet?style=for-the-badge)](https://deepmind.google)

## ✨ 주요 기능

- 📊 **역대 당첨번호 분석** - 1회~1206회 전체 데이터 (22년치)
- 🎲 **당첨 확률 시각화** - 1등~5등 확률 인포그래픽
- 🗺️ **복권 판매점 찾기** - 네이버 지도를 통한 주변 판매점 검색
- 🔥 **핫/콜드 번호** - 최근 트렌드 및 미출현 번호 추적
- 🎯 **번호 추천** - 통계 기반 4가지 추천 알고리즘
- 🌙 **다크모드** - 라이트/다크 테마 지원
- 📱 **PWA 지원** - 모바일 앱처럼 설치 가능
- 🔄 **자동 업데이트** - 새 회차 데이터 자동 반영

## 🖼️ 스크린샷

| 라이트 모드 | 다크 모드 |
|-----------|----------|
| ![Light](https://via.placeholder.com/400x300/f0f4f8/1e293b?text=Light+Mode) | ![Dark](https://via.placeholder.com/400x300/0f172a/f1f5f9?text=Dark+Mode) |

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 🛠️ 기술 스택

- **Vite** - 빌드 도구
- **Chart.js** - 데이터 시각화
- **Vanilla JS** - 프레임워크 없이 순수 JavaScript
- **CSS Variables** - 다크모드 구현

## 📁 프로젝트 구조

```
lotto-gen/
├── index.html          # 메인 HTML
├── public/
│   ├── manifest.json   # PWA 매니페스트
│   └── sw.js           # 서비스 워커
└── src/
    ├── main.js         # 메인 애플리케이션
    ├── styles/
    │   └── main.css    # 스타일 (라이트/다크 테마)
    ├── data/
    │   ├── lotto-data.js    # 역대 당첨번호 데이터
    │   └── data-service.js  # 자동 업데이트 서비스
    └── analysis/
        ├── frequency.js      # 빈도 분석
        ├── patterns.js       # 패턴 분석
        ├── timeline.js       # 시계열 분석
        └── recommendation.js # 번호 추천
```

## ⚠️ 면책 조항

> **로또는 완전 랜덤 게임입니다.**  
> 이 분석 도구는 재미와 참고용이며, 당첨 확률을 높여주지 않습니다.  
> 1등 당첨 확률: **8,145,060분의 1** (변하지 않음)

## 📝 데이터 출처

- [동행복권](https://www.dhlottery.co.kr/) - 공식 로또 데이터
- [smok95/lotto](https://github.com/smok95/lotto) - GitHub 데이터 API

## 🤖 About

이 프로젝트는 **Google DeepMind Antigravity** AI 코딩 어시스턴트를 사용하여 개발되었습니다.

---

Made with 💛 and ☘️ luck
