import {
  CarbonFactorItem,
  DiagnosticReport,
  HotspotItem,
  PsychologyNudgeCard,
  ReceiptItem,
  SurveyResponse,
} from '../types';

export function calculateReceiptItemCarbon(
  price: number,
  quantity: number,
  factor: CarbonFactorItem
): number {
  // 사용자의 정확한 지적대로, 탄소 배출량은 가격이 아닌 실물 수량/질량/중량(kg, g, 개수)에 직접 비례함.
  // 1. 수량/단위 기반 배출량 (기본 및 최우선 적용)
  const qty = quantity && quantity > 0 ? quantity : 1;
  const unitBasedG = qty * factor.carbon_factor_per_unit;
  
  // 2. 단가가 유효하고 1,000원당 배출계수가 정의되어 있을 경우 보조 계산
  const priceBasedG = price > 0 ? (price / 1000) * factor.carbon_factor_per_1000krw : 0;

  // 수량/단위 기반 탄소발자국 계수를 우선 적용 (수량 단위 계수가 존재하면 수량 기반, 없으면 금액 기반)
  const carbonG = factor.carbon_factor_per_unit > 0 ? unitBasedG : priceBasedG;
  return Math.round(carbonG);
}

export function generateDiagnosticReport(
  survey: SurveyResponse,
  receiptItems: ReceiptItem[],
  peerAvgCarbonG: number = 12800
): DiagnosticReport {
  const perceivedEcoScore = survey.perceivedEcoScore;

  // 1. 총 탄소 배출량 계산
  const actualCarbonG = receiptItems.reduce((sum, item) => sum + item.carbon_g, 0);

  // 2. 실제 친환경 점수 환산 (100점 만점 기준: 4,000g 이하=95점, 15,000g 이상=20점)
  let actualEcoScore = 100 - Math.round((actualCarbonG / 16000) * 80);
  actualEcoScore = Math.max(10, Math.min(98, actualEcoScore));

  // 3. 타인 비교 계산
  const diffFromPeer = actualCarbonG - peerAvgCarbonG;
  const peerComparisonPercent = Math.round((diffFromPeer / peerAvgCarbonG) * 100);

  let peerComparisonText = '';
  if (peerComparisonPercent > 10) {
    peerComparisonText = `비교 대상(2030 평균) 대비 탄소 배출량이 ${peerComparisonPercent}% 높습니다.`;
  } else if (peerComparisonPercent < -10) {
    peerComparisonText = `비교 대상(2030 평균) 대비 탄소 배출량이 ${Math.abs(peerComparisonPercent)}% 적은 우수한 수치입니다!`;
  } else {
    peerComparisonText = `비교 대상(2030 평균)과 비슷한 수준의 탄소 배출량을 보이고 있습니다.`;
  }

  // 4. 괴리도 분석 (주관적 점수 - 객관적 점수)
  const gapScore = perceivedEcoScore - actualEcoScore;
  let gapType: 'overestimated' | 'realistic' | 'underestimated' = 'realistic';
  let gapTitle = '';
  let gapDescription = '';

  if (gapScore >= 15) {
    gapType = 'overestimated';
    gapTitle = '⚠️ 친환경 자아착시형 (과대평가)';
    gapDescription = `스스로 친환경적이라고 생각하시지만(${perceivedEcoScore}점), 실제 영수증 탄소 배출량 기준 객관적 점수는 ${actualEcoScore}점입니다. 육류/배달/일회용품 구매에서 인지하지 못한 탄소가 누출되고 있습니다.`;
  } else if (gapScore <= -15) {
    gapType = 'underestimated';
    gapTitle = '🌱 겸손한 실천가형 (과소평가)';
    gapDescription = `본인의 습관에 엄격하여 스스로 낮은 점수(${perceivedEcoScore}점)를 주셨지만, 실제 구하기 어려운 저탄소 소비(${actualEcoScore}점)를 훌륭히 실천하고 계십니다!`;
  } else {
    gapType = 'realistic';
    gapTitle = '🎯 객관적 친환경 인식형 (일치)';
    gapDescription = `자신의 소비 습관이 환경에 미치는 영향을 메타인지적으로 정확히 파악하고 계십니다(주관적 ${perceivedEcoScore}점 vs 실제 ${actualEcoScore}점).`;
  }

  // 5. 카테고리별 탄소 배출 분석
  const categoryMap: Record<string, number> = {};
  receiptItems.forEach((item) => {
    const cat = item.category || '기타';
    categoryMap[cat] = (categoryMap[cat] || 0) + item.carbon_g;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, carbon_g]) => ({
    category,
    carbon_g,
    percentage: actualCarbonG > 0 ? Math.round((carbon_g / actualCarbonG) * 100) : 0,
  }));

  // 6. 탄소 주범 Top 3 (Hotspots)
  const sortedItems = [...receiptItems].sort((a, b) => b.carbon_g - a.carbon_g);
  const hotspots: HotspotItem[] = sortedItems.slice(0, 3).map((item) => {
    const savingsG = Math.round(item.carbon_g * 0.6); // 대체 시 60% 절감 가정
    return {
      category: item.category,
      itemName: item.matched_name || item.raw_name,
      carbonG: item.carbon_g,
      percentageOfTotal: actualCarbonG > 0 ? Math.round((item.carbon_g / actualCarbonG) * 100) : 0,
      alternative: item.eco_alternative || '저탄소 친환경 대체재',
      savingsG,
    };
  });

  // 7. 심리학 기반 넛지 카드 생성 (기본 룰 기반)
  const nudgeCards: PsychologyNudgeCard[] = generatePsychologyNudges(
    gapType,
    hotspots,
    peerComparisonPercent
  );

  return {
    perceivedEcoScore,
    actualEcoScore,
    actualCarbonG,
    peerAvgCarbonG,
    peerComparisonPercent,
    peerComparisonText,
    gapScore,
    gapType,
    gapTitle,
    gapDescription,
    categoryBreakdown,
    hotspots,
    nudgeCards,
  };
}

export function generatePsychologyNudges(
  gapType: 'overestimated' | 'realistic' | 'underestimated',
  hotspots: HotspotItem[],
  peerComparisonPercent: number
): PsychologyNudgeCard[] {
  const cards: PsychologyNudgeCard[] = [];

  // 카드 1: 손실 회피 (Loss Aversion)
  const topItem = hotspots[0];
  if (topItem) {
    cards.push({
      id: 'nudge_loss_aversion',
      theory_tag: '손실 회피 (Loss Aversion)',
      title: `${topItem.itemName} 선택으로 버려지는 탄소 기회비용`,
      description: `${topItem.itemName} 구매로 소모된 탄소 ${topItem.carbonG}g은 소나무 약 ${Math.round(topItem.carbonG / 15)}그루가 1년간 흡수해야 할 수치입니다. ${topItem.alternative}로 바꾸면 매달 약 ${topItem.savingsG * 4}g의 탄소를 잃지 않고 지킬 수 있습니다.`,
      action_step: `다음 장보기에서 ${topItem.itemName} 대신 ${topItem.alternative} 선택하기`,
      expected_reduction_g: topItem.savingsG,
    });
  }

  // 카드 2: 사회적 증거 (Social Proof)
  cards.push({
    id: 'nudge_social_proof',
    theory_tag: '사회적 증거 (Social Proof)',
    title: '동일 연령대 82%가 실천 중인 그린 소비 규칙',
    description:
      peerComparisonPercent > 0
        ? `상위 15% 저탄소 가구는 배달 및 육류 구매 시 주 1회 '그린 데이(Green Day)'를 정해 식물성 대체식을 소비합니다.`
        : `귀하는 이미 또래 평균보다 훨씬 높은 수준의 친환경 라이프스타일을 보이고 계십니다. 주변 친구들에게 이 습관을 공유해 보세요.`,
    action_step: `매주 수요일을 '일회용 용기 없는 날'로 지정하기`,
    expected_reduction_g: 1200,
  });

  // 카드 3: 실행 의도 (If-Then Planning)
  cards.push({
    id: 'nudge_if_then',
    theory_tag: '실행 의도 (If-Then Planning)',
    title: '행동 구체화: 상황별 자동 응답 규칙',
    description: `습관 형성을 위해 '만약 [상황]이 발생하면, [대체 행동]을 한다'는 인지 공식을 적용해보세요.`,
    action_step: `[IF] 카페에 가거나 음료를 주문할 때 → [THEN] 가방 속 텀블러를 내밀고 오트유로 변경 요청한다.`,
    expected_reduction_g: 850,
  });

  return cards;
}
