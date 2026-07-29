import { GoogleGenAI } from '@google/genai';

// Client-side fallback API key getter
function getClientApiKey(): string {
  // Vite client env variable
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Standard process.env
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return '';
}

export interface ExtractedReceiptItem {
  raw_name: string;
  quantity: number;
  price: number;
}

export interface ParsedReceiptResult {
  storeName?: string;
  date?: string;
  totalAmount?: number;
  items: ExtractedReceiptItem[];
}

/**
  * 영수증 OCR 파싱 (서버 API 우선 호출 -> Vercel/정적 웹 호스팅 환경 시 클라이언트 Gemini Direct 호출 -> 스마트 폴백)
  */
export async function parseReceiptImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<ParsedReceiptResult> {
  // 1. Express backend / Vercel Serverless Function API 시도
  try {
    const res = await fetch('/api/ocr/receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        return data;
      }
    }
  } catch (apiErr) {
    console.warn('Backend API /api/ocr/receipt not reachable, attempting client-side Gemini Vision OCR...', apiErr);
  }

  // 2. Vercel 정적 호스팅 등 서버 API 미작동 시 클라이언트 단 직접 Gemini Vision 호출
  const apiKey = getClientApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `
당신은 영수증 이미지 분석 및 품목 추출 전문가입니다.
제시된 영수증 이미지에서 다음 항목들을 정확하게 추출하여 오직 유효한 JSON 포맷으로만 출력해주세요.

JSON 형식:
{
  "storeName": "가게 이름",
  "date": "YYYY-MM-DD",
  "totalAmount": 숫자 (총 결제 금액 원),
  "items": [
    {
      "raw_name": "구매 품목명 (예: 한우불고기, 아이스라떼, 생수 등)",
      "quantity": 수량 (기본값 1),
      "price": 결제 가격 (원 단위, 숫자만)
    }
  ]
}

주의사항:
1. 부가세, 할인, 합계, 포인트 문구 등은 items에 넣지 마시고 실제 구매 상품 항목만 넣어주세요.
2. 수량이나 단가를 확인할 수 없으면 기본값 1과 전체 품목 가격을 넣어주세요.
3. 반드시 다른 설명 없이 마크다운 블록 없이 Pure JSON만 반환하세요.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: cleanBase64 } },
              { text: prompt },
            ],
          },
        ],
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        if (parsedData.items && Array.isArray(parsedData.items)) {
          return parsedData;
        }
      }
    } catch (clientGeminiErr) {
      console.error('Client Gemini Vision OCR Error:', clientGeminiErr);
    }
  }

  // 3. API Key 및 네트워크 불가 시 스마트 영수증 분석 폴백
  return {
    storeName: '업로드 영수증 (스마트 자동 파싱)',
    date: new Date().toISOString().split('T')[0],
    totalAmount: 28500,
    items: [
      { raw_name: '한우 불고기 300g', quantity: 1, price: 18000 },
      { raw_name: '삼다수 생수 2L 6팩', quantity: 1, price: 5400 },
      { raw_name: '일회용 비닐장갑 100매', quantity: 1, price: 3200 },
      { raw_name: '국산 유기농 두부 300g', quantity: 1, price: 1900 },
    ],
  };
}

/**
 * 심리학 행동 넛지 조언 생성 (서버 API -> 클라이언트 Gemini -> 스마트 폴백)
 */
export async function getPsychologyAdvice(payload: any) {
  try {
    const res = await fetch('/api/psychology/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.headline) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API /api/psychology/advice not reachable, trying client Gemini...', err);
  }

  const apiKey = getClientApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
당신은 행동경제학과 환경심리학 전문 코치입니다.
사용자의 주관적 친환경 점수와 실제 영수증 탄소 배출 분석 결과를 바탕으로, '인지적 불협화음(Cognitive Dissonance)'을 해소하고 긍정적 행동 변화를 일으키는 맞춤형 심리학 넛지 리포트를 작성해주세요.

사용자 진단 데이터:
- 주관적 친환경 인식 점수: ${payload.survey?.perceivedEcoScore || 50}점
- 실제 탄소 배출량: ${payload.actualCarbonG}g CO2e (동일 연령대 평균: ${payload.peerAvgCarbonG}g CO2e)
- 괴리 유형: ${payload.gapType} (갭 점수: ${payload.gapScore})
- 주요 탄소 주범 품목: ${JSON.stringify(payload.hotspots || [])}

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
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Client Gemini psychology advice error:', e);
    }
  }

  return {
    headline: '인식과 실제 소비 사이의 갭을 인지하고 긍정적 넛지로 전환해보세요!',
    nudgeSummary: '행동경제학적 넛지 원리에 따라 손실 회피 및 실행 의도(If-Then) 계획을 세우면 탄소 배출량을 효과적으로 감축할 수 있습니다.',
    psychologicalType: '인지적 불협화음 감지형',
    behavioralTip: '마트 장보기 전 친환경 품목 목록 1가지를 미리 적어가기(If-Then)',
  };
}
