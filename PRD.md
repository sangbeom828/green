# PRD: 친환경 소비 자기인식 진단 도구 (Eco-Consumption Self-Awareness Diagnostic Tool)

## 1. 제품 개요 (Product Overview)
- **제품명**: 친환경 소비 자기인식 진단 도구 (Eco-Consumption Diagnostic Engine)
- **목적**: 사용자가 주관적으로 인식하는 친환경 소비 수준과 실제 구매 영수증 기반 탄소 배출량 데이터 간의 괴리(Gap)를 직관적으로 분석하고, 다른 사람과의 소비 비교 지표를 제공하며, 행동경제학/심리학 이론에 기반한 맞춤형 넛지(Nudge) 조언을 제공함.
- **주요 대상**: 자신의 소비 습관이 환경에 미치는 실제 영향을 확인하고, 실질적인 친환경 소비 행동 변화를 원하는 모든 사용자.

---

## 2. 핵심 유저 플로우 및 기능 명세 (5-Phase Workflow)

### Phase 1) 자기인식 설문 (Self-Perception Survey)
- **목적**: 사용자가 스스로 생각하는 평소 친환경 소비 수준 및 습관 파악.
- **주요 항목**:
  - 식생활(육류/채식 비율, 배달음식 이용 빈도)
  - 쇼핑/생필품(친환경 인증제품 선호도, 일회용품 사용 빈도)
  - 이동/에너지(대중교통/자차, 에너지 절약 습관)
  - 주관적 친환경 지수 점수 평가 (1~100점)

### Phase 2) 영수증 수집 및 데이터 매칭 (Receipt Collection & DB Matching)
- **목적**: 실제 구매 내역 정보 수집 및 CSV 탄소 계수 DB 매칭.
- **주요 기능**:
  - **카메라 촬영 / 이미지 업로드**: 영수증 사진 업로드 기능 (`requestFramePermissions: ["camera"]`).
  - **Gemini Vision OCR**: AI를 통한 영수증 내 품목명, 수량, 금액 자동 추출.
  - **CSV DB 매칭**: 추출된 품목명을 표준 CSV DB (`eco_carbon_factors.csv`) 항목과 매칭 및 직접 수정/추가 기능.

### Phase 3) 탄소 산출 및 타인 비교 (Carbon Footprint & Peer Comparison)
- **목적**: 수집된 영수증 품목의 실제 탄소 발자국(g CO2e) 계산 및 타인 평균 비교.
- **주요 기능**:
  - **탄소 배출량 계산 엔진**: `품목별 탄소 배출 계수 × 구매 금액/수량`을 통한 총 탄소 배출량 산출.
  - **타인 비교 분석 (Peer Benchmark)**: `peer_benchmark.csv` 데이터를 기반으로 동일 조건 타인 평균 대비 배출량(%) 및 성향 비교.

### Phase 4) 인식-실제 괴리 분석 (Perception vs. Reality Gap Analysis)
- **목적**: 주관적 인식 점수와 실제 탄소 배출량 간의 착시/괴리율 진단.
- **주요 기능**:
  - **괴리율 지수(Gap Score) 산출**: 주관적 인식 등급 vs 객관적 탄소 배출 등급(A+ ~ F) 격차 분석.
  - **시각화 리포트**: Recharts 기반 레이더 차트, 비교 바 차트, 카테고리별 탄소 기여도 파이 차트 제공.
  - **주요 탄소 주범(Hotspot) 피드백**: 가장 많은 탄소를 배출한 Top 3 품목 및 대체재 제안.

### Phase 5) 심리학 기반 조언 생성 (Psychology-Based Nudge & Action Plan)
- **목적**: 인지적 불협화음(Cognitive Dissonance)을 해소하고 긍정적 행동 변화 유도.
- **주요 기능**:
  - **심리학 프레이밍**: 손실 회피(Loss Aversion), 사회적 동기(Social Proof), 실행 의도(If-Then Plan) 적용.
  - **Gemini AI 기반 맞춤형 코칭**: 사용자의 괴리 유형(예: "과대평가형 에코 리더", "실천형 행동가" 등)에 맞춘 실천 과제 카드 생성.

---

## 3. 데이터 구조 명세 (Data Specifications)

1. **`eco_carbon_factors.csv` (품목별 탄소 계수 DB)**
   - `id`, `category`, `item_name`, `carbon_factor_per_1000krw` (g CO2e / 1,000원), `carbon_factor_per_unit` (g CO2e / 개), `eco_friendly_alternative`, `reduction_tip`

2. **`peer_benchmark.csv` (타인 평균 비교 DB)**
   - `demographic_group`, `avg_monthly_receipt_amount`, `avg_carbon_emission_g`, `top_category`

---

## 4. UI/UX 디자인 가이드라인
- **디자인 컨셉**: Clean Eco-Modern (자연 친화적 딥 그린, 올리브, 소프트 워시 베이지, 고대비 타이포그래피).
- **반응형 대응**: 모바일 및 데스크톱 모드 최적화.
- **인터랙션**: 단계별 진행률 프로그레스 바, Smooth Motion 애니메이션, 마이크로 인터랙션 카드.

---

## 5. 확인 및 검증 항목
- 영수증 이미지 OCR 정확도 및 예외처리 (수동 수정 지원).
- CSV 매칭 미완료 품목에 대한 유사 카테고리 자동 추천 logic.
- 인식 점수와 실제 산출량 간의 정밀한 괴리 지수 수식 검증.
