# ACTION PLAN: 친환경 소비 자기인식 진단 도구 구현 계획

## Step 1: 프로젝트 기초 구성 및 CSV 데이터베이스 구축
1. **타입 및 구조 설계 (`src/types.ts`)**:
   - 설문 문항 및 응답 데이터 타입
   - 영수증 추출 품목 및 CSV 탄소 계수 타입
   - 괴리 분석 리포트 및 심리학 넛지 카드 타입
2. **기본 CSV 데이터 파일 생성**:
   - `public/data/eco_carbon_factors.csv`: 국내 주요 생필품, 식료품, 배달, 다회용품 등의 탄소 배출 계수 데이터 구축.
   - `public/data/peer_benchmark.csv`: 타인(연령대/1인가구/일반가구 등) 평균 소비 및 탄소 배출량 표준 데이터 구축.
3. **CSV 파서 및 데이터 매칭 엔진 (`src/utils/csvParser.ts`, `src/utils/carbonCalculator.ts`)**:
   - 영수증 품목명과 CSV DB 품목 간 키워드 유사도 매칭 알고리즘 구현.

---

## Step 2: Express 백엔드 API & Gemini AI 서버 구축
1. **`server.ts` 구현**:
   - `0.0.0.0:3000` 바인딩 및 Vite Dev Middleware 연동.
   - `POST /api/ocr/receipt`: Gemini Vision API (`gemini-3.6-flash`)를 이용하여 영수증 사진에서 품목명, 수량, 금액, 구매처 자동 추출.
   - `POST /api/psychology/advice`: 사용자 설문 결과 + 실제 영수증 탄소 산출 결과 + 괴리 분석 데이터를 종합하여 행동경제학/심리학 넛지(Nudge) 메시지 및 If-Then 실행 계획 생성.
2. **`package.json` 스크립트 구성**:
   - `"dev": "tsx server.ts"`
   - `"build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs"`
   - `"start": "node dist/server.cjs"`

---

## Step 3: Phase 1~5 대화형 진단 UI 개발
1. **Phase 1: 자기인식 설문 (Survey)**
   - 대화형 스텝 바이 스텝 친환경 소비 습관 설문 UI.
   - 주관적 친환경 자신감 슬라이더 (1~100점) 제공.
2. **Phase 2: 영수증 수집 및 매칭 (Receipt Collection)**
   - 사진 촬영/파일 업로드 dropzone 및 실시간 OCR 진행 상태 표시.
   - OCR 추출 품목과 CSV DB 매칭 테이블 UI (품목 수동 수정, 신규 추가, CSV 항목 검색 지원).
3. **Phase 3: 탄소 산출 및 타인 비교 (Carbon Calculation & Peer Comparison)**
   - 영수증 품목별 CO2e 산출 현황.
   - 타인 평균 배출량 대비 백분율(%) 산출 및 비교 인디케이터.
4. **Phase 4: 인식 vs 실제 괴리 분석 (Gap Analysis Report)**
   - 주관적 점수 vs 실제 탄소 등급 격차 시각화 (Recharts 레이더/바 차트).
   - "내가 다른 사람과 비교해서 얼마나 더/덜 쓰고 있는지" 명확한 텍스트 및 그래프 분석.
   - 탄소 배출 주범 Top 3 품목 식별.
5. **Phase 5: 심리학 기반 맞춤 조언 및 행동 카드 (Psychological Nudges)**
   - 괴리 유형 진단 (예: 과대평가형, 실천형, 인식 부족형 등).
   - Nudge 기법(손실 회피 프레이밍, 사회적 동조, If-Then 실행 계획) 카드.
   - 친환경 대체 소비재 추천 및 절감 예상 탄소량 제시.

---

## Step 4: 종합 검증 및 빌드 확인
1. `compile_applet`을 통한 TypeScript compilation 및 서버 빌드 정상 확인.
2. 영수증 이미지 예외 처리 및 CSV 매칭 보완 테스트.
