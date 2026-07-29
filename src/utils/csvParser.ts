import Papa from 'papaparse';
import { CarbonFactorItem, PeerBenchmarkData } from '../types';

let cachedFactors: CarbonFactorItem[] | null = null;
let cachedBenchmarks: PeerBenchmarkData[] | null = null;

// 기본 폴백 데이터 (네트워크 지연이나 로컬 파일 로드 실패 대비)
const FALLBACK_FACTORS: CarbonFactorItem[] = [
  {
    id: 'CF001',
    category: '육류/가공육',
    item_name: '소고기(국내산/수입)',
    keywords: ['소고기', '한우', '불고기', '등심', '안심', '갈비', '차돌박이'],
    carbon_factor_per_1000krw: 1850,
    carbon_factor_per_unit: 2700,
    eco_friendly_alternative: '식물성 대체육 / 두부 / 콩고기',
    reduction_tip: '소고기 소비를 식물성 단백질로 대체 시 탄소 90% 절감',
  },
  {
    id: 'CF002',
    category: '육류/가공육',
    item_name: '돼지고기(삼겹살/목살)',
    keywords: ['돼지고기', '삼겹살', '목살', '돼지', '제육', '돈까스', '햄', '소시지'],
    carbon_factor_per_1000krw: 620,
    carbon_factor_per_unit: 950,
    eco_friendly_alternative: '닭고기 또는 템페/두부',
    reduction_tip: '돼지고기 소비 주 1회 줄이기',
  },
  {
    id: 'CF003',
    category: '육류/가공육',
    item_name: '닭고기/오리고기',
    keywords: ['닭', '치킨', '닭가슴살', '닭갈비', '삼계탕', '오리', '치킨너겟'],
    carbon_factor_per_1000krw: 310,
    carbon_factor_per_unit: 480,
    eco_friendly_alternative: '버섯 및 두부 요리',
    reduction_tip: '대중적인 육류 중 비교적 탄소발자국이 적으나 대체 식단 활용 가능',
  },
  {
    id: 'CF006',
    category: '채소/신선식품',
    item_name: '두부/콩나물/버섯',
    keywords: ['두부', '순두부', '콩나물', '숙주', '버섯', '팽이버섯', '새송이'],
    carbon_factor_per_1000krw: 85,
    carbon_factor_per_unit: 90,
    eco_friendly_alternative: '로컬푸드 저탄소 인증 채소',
    reduction_tip: '저탄소 농산물 인증 마크 확인하기',
  },
  {
    id: 'CF011',
    category: '유제품/음료',
    item_name: '아메리카노/에스프레소',
    keywords: ['아메리카노', '드립커피', '더치커피', '원두', '커피'],
    carbon_factor_per_1000krw: 150,
    carbon_factor_per_unit: 180,
    eco_friendly_alternative: '텀블러 지참 할인 / 다회용 컵',
    reduction_tip: '텀블러 사용 시 일회용 컵 탄소 절감',
  },
  {
    id: 'CF017',
    category: '배달/외식',
    item_name: '배달음식(일회용용기 포함)',
    keywords: ['배달', '족발', '보쌈', '피자', '떡볶이', '마라탕', '중화요리', '야식', '찌개', '배달팁'],
    carbon_factor_per_1000krw: 580,
    carbon_factor_per_unit: 820,
    eco_friendly_alternative: '다회용기 배달 서비스 / 포장 수거',
    reduction_tip: '플라스틱 일회용 용기 및 배달 수송 탄소 절감',
  },
  {
    id: 'CF019',
    category: '생활용품/잡화',
    item_name: '일회용품/플라스틱용기',
    keywords: ['일회용', '플라스틱', '비닐', '비닐봉투', '지퍼백', '위생장갑', '빨대'],
    carbon_factor_per_1000krw: 890,
    carbon_factor_per_unit: 950,
    eco_friendly_alternative: '장바구니 / 다회용 밀폐용기',
    reduction_tip: '일회용 플라스틱 최소화',
  },
  {
    id: 'CF024',
    category: '친환경인증',
    item_name: '저탄소/친환경인증 상품',
    keywords: ['친환경', '저탄소', '무농약', '유기농', 'GAP인증', '제로웨이스트', '리사이클'],
    carbon_factor_per_1000krw: 45,
    carbon_factor_per_unit: 60,
    eco_friendly_alternative: '지속 가능한 친환경 상품 소비',
    reduction_tip: '저탄소 인증 표지 확인',
  },
];

export async function loadEcoCarbonFactors(): Promise<CarbonFactorItem[]> {
  if (cachedFactors) return cachedFactors;
  try {
    const response = await fetch('/data/eco_carbon_factors.csv');
    if (!response.ok) throw new Error('Failed to fetch CSV');
    const csvText = await response.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const items: CarbonFactorItem[] = parsed.data.map((row, index) => ({
      id: row.id || `CF_${index}`,
      category: row.category || '기타',
      item_name: row.item_name || '일반 상품',
      keywords: row.keywords ? row.keywords.split(';').map((k) => k.trim().toLowerCase()) : [],
      carbon_factor_per_1000krw: parseFloat(row.carbon_factor_per_1000krw || '250'),
      carbon_factor_per_unit: parseFloat(row.carbon_factor_per_unit || '300'),
      eco_friendly_alternative: row.eco_friendly_alternative || '친환경 인증 대체품',
      reduction_tip: row.reduction_tip || '저탄소 제로웨이스트 실천하기',
    }));

    cachedFactors = items.length > 0 ? items : FALLBACK_FACTORS;
    return cachedFactors;
  } catch (error) {
    console.warn('Using fallback eco carbon factors:', error);
    cachedFactors = FALLBACK_FACTORS;
    return cachedFactors;
  }
}

export async function loadPeerBenchmark(): Promise<PeerBenchmarkData[]> {
  if (cachedBenchmarks) return cachedBenchmarks;
  try {
    const response = await fetch('/data/peer_benchmark.csv');
    if (!response.ok) throw new Error('Failed to fetch benchmark CSV');
    const csvText = await response.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const items: PeerBenchmarkData[] = parsed.data.map((row) => ({
      group_id: row.group_id || 'G001',
      group_name: row.group_name || '전국 2030 1인 가구 평균',
      avg_receipt_amount: parseFloat(row.avg_receipt_amount || '45000'),
      avg_carbon_g: parseFloat(row.avg_carbon_g || '12800'),
      category_breakdown: {
        '육류/가공육': parseFloat(row.meat_percent || '35'),
        '배달/외식': parseFloat(row.delivery_percent || '30'),
        '간편식/가공식품': parseFloat(row.processed_percent || '20'),
        '친환경/채소': parseFloat(row.eco_percent || '15'),
      },
    }));

    cachedBenchmarks = items;
    return cachedBenchmarks;
  } catch (error) {
    console.warn('Using fallback peer benchmark:', error);
    cachedBenchmarks = [
      {
        group_id: 'G001',
        group_name: '전국 2030 1인 가구 평균',
        avg_receipt_amount: 45000,
        avg_carbon_g: 12800,
        category_breakdown: {
          '육류/가공육': 35,
          '배달/외식': 30,
          '간편식/가공식품': 20,
          '채소/신선식품': 15,
        },
      },
    ];
    return cachedBenchmarks;
  }
}

export function findBestFactorMatch(
  rawName: string,
  factors: CarbonFactorItem[]
): CarbonFactorItem {
  const clean = rawName.trim().toLowerCase();

  let bestMatch: CarbonFactorItem | null = null;
  let highestScore = 0;

  for (const factor of factors) {
    let score = 0;
    // 1. Exact name match
    if (factor.item_name.toLowerCase().includes(clean) || clean.includes(factor.item_name.toLowerCase())) {
      score += 10;
    }

    // 2. Keyword hits
    for (const kw of factor.keywords) {
      if (kw && clean.includes(kw)) {
        score += 5;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = factor;
    }
  }

  // 매칭되는 항목이 없으면 기본 '간편식/가공식품' 또는 평균 계수 항목 반환
  if (!bestMatch || highestScore === 0) {
    return (
      factors.find((f) => f.category === '간편식/가공식품') ||
      factors[0] || {
        id: 'CF_DEFAULT',
        category: '일반/가공식품',
        item_name: '기타 생필품',
        keywords: [],
        carbon_factor_per_1000krw: 220,
        carbon_factor_per_unit: 250,
        eco_friendly_alternative: '저탄소 인증 상품',
        reduction_tip: '불필요한 포장재가 적은 상품을 고르세요.',
      }
    );
  }

  return bestMatch;
}
