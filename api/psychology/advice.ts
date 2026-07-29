import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { survey, actualCarbonG, peerAvgCarbonG, gapType, gapScore, hotspots } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        headline: '인식과 실제 소비 사이의 갭을 인지하고 긍정적 넛지로 전환해보세요!',
        nudgeSummary: '행동경제학적 넛지 원리에 따라 손실 회피 및 실행 의도 계획을 세우면 탄소 배출량을 효과적으로 줄일 수 있습니다.',
        psychologicalType: '인지적 불협화음 인지형',
        behavioralTip: '장보기 전 필수 목록 1가지 적어가기',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
당신은 행동경제학과 환경심리학 전문 코치입니다.
사용자의 주관적 친환경 점수와 실제 영수증 탄소 배출 분석 결과를 바탕으로, '인지적 불협화음(Cognitive Dissonance)'을 해소하고 긍정적 행동 변화를 일으키는 맞춤형 심리학 넛지 리포트를 작성해주세요.

사용자 진단 데이터:
- 주관적 친환경 인식 점수: ${survey?.perceivedEcoScore || 50}점
- 실제 탄소 배출량: ${actualCarbonG}g CO2e (동일 연령대 평균: ${peerAvgCarbonG}g CO2e)
- 괴리 유형: ${gapType} (갭 점수: ${gapScore})
- 주요 탄소 주범 품목: ${JSON.stringify(hotspots || [])}

다음 유효한 JSON 형식으로만 응답하세요:
{
  "headline": "사용자에게 영감을 주는 한 줄 행동 심리학 헤드라인",
  "nudgeSummary": "인식과 실제의 괴리에 대한 따뜻하고 객관적인 행동 심리학적 진단 메시지 (3줄 이내)",
  "psychologicalType": "심리학 유형명 (예: '위장형 친환경주의 착시', '실천 중심의 겸손한 그린리더' 등)",
  "behavioralTip": "일상에서 바로 적용할 수 있는 강력한 If-Then 넛지 팁"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return res.status(200).json(parsedData);
    } else {
      return res.status(200).json({
        headline: '소비 인식을 높이면 자연스럽게 지구를 지키는 습관이 형성됩니다!',
        nudgeSummary: '작은 일상의 변화가 모여 큰 환경적 차이를 만듭니다.',
      });
    }
  } catch (error: any) {
    console.error('Vercel Psychology Advice Error:', error);
    return res.status(200).json({
      headline: '지속 가능한 친환경 소비 습관을 향해 한 걸음 더 나아가세요!',
      nudgeSummary: '실제 소비 데이터를 주기적으로 모니터링하는 것만으로도 탄소 배출이 감축됩니다.',
    });
  }
}
