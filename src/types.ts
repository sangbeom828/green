export type Phase = 'survey' | 'receipt' | 'calculation' | 'gap_analysis' | 'psychology';

export interface SurveyResponse {
  meatFrequency: 'rarely' | 'sometimes' | 'frequently' | 'daily'; // 식생활: 육류 소비
  deliveryFrequency: 'none' | '1-2' | '3-4' | '5+'; // 주간 배달/외식 빈도
  ecoProductPreference: 'low' | 'medium' | 'high'; // 친환경 인증 상품 구매 선호도
  disposableUsage: 'low' | 'medium' | 'high'; // 일회용품/플라스틱 사용 빈도
  transportMode: 'walk_transit' | 'hybrid_ev' | 'gas_car'; // 주요 이동 수단
  perceivedEcoScore: number; // 주관적 친환경 점수 (1 ~ 100)
}

export interface CarbonFactorItem {
  id: string;
  category: string; // 예: 육류, 채소/과일, 음료/카페, 배달/외식, 공산품/일회용, 교통 등
  item_name: string; // 상품명/카테고리명
  keywords: string[]; // 매칭용 키워드
  carbon_factor_per_1000krw: number; // 1,000원당 탄소 배출량 (g CO2e)
  carbon_factor_per_unit: number; // 개당/단위당 탄소 배출량 (g CO2e)
  eco_friendly_alternative: string; // 친환경 대체재
  reduction_tip: string; // 절감 팁
}

export interface PeerBenchmarkData {
  group_id: string;
  group_name: string; // 예: "전국 평균 성인 1인 가구", "친환경 실천 상위 20% 그룹"
  avg_receipt_amount: number; // 평균 구매액
  avg_carbon_g: number; // 평균 탄소 배출량 (g CO2e)
  category_breakdown: Record<string, number>; // 카테고리별 탄소 배출 비중 (%)
}

export interface ReceiptItem {
  id: string;
  raw_name: string; // 영수증 원본 이름
  quantity: number; // 수량
  price: number; // 금액 (원)
  matched_factor_id: string; // CSV 매칭 항목 ID
  matched_name: string; // 매칭된 표준 상품명
  category: string; // 카테고리
  carbon_g: number; // 산출된 탄소 배출량 (g CO2e)
  eco_alternative?: string;
  reduction_tip?: string;
  source_receipt?: string; // 출처 영수증 구분 (다중 영수증 지원)
}

export interface ReceiptData {
  storeName: string;
  date: string;
  items: ReceiptItem[];
  totalAmount: number;
  totalCarbonG: number;
  imageUrl?: string;
}

export interface HotspotItem {
  category: string;
  itemName: string;
  carbonG: number;
  percentageOfTotal: number;
  alternative: string;
  savingsG: number;
}

export interface PsychologyNudgeCard {
  id: string;
  theory_tag: string; // 예: "손실 회피 (Loss Aversion)", "사회적 증거 (Social Proof)", "실행 의도 (If-Then Planning)"
  title: string;
  description: string;
  action_step: string;
  expected_reduction_g: number;
}

export interface DiagnosticReport {
  perceivedEcoScore: number; // 주관적 점수 (1~100)
  actualEcoScore: number; // 객관적 탄소 배출 환산 점수 (1~100)
  actualCarbonG: number; // 실제 탄소 배출량 (g CO2e)
  peerAvgCarbonG: number; // 타인 평균 탄소 배출량 (g CO2e)
  peerComparisonPercent: number; // 타인 대비 배출 비율 (예: -18% 더 큼/작음)
  peerComparisonText: string;
  gapScore: number; // 주관적 - 객관적 차이 (+면 과대평가, -면 과소평가)
  gapType: 'overestimated' | 'realistic' | 'underestimated'; // 괴리 유형
  gapTitle: string;
  gapDescription: string;
  categoryBreakdown: { category: string; carbon_g: number; percentage: number }[];
  hotspots: HotspotItem[];
  nudgeCards: PsychologyNudgeCard[];
}
