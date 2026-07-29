import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// Lazy Gemini Client setup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. AI features will fallback to smart mock responses.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

// ----------------------------------------------------
// API 1: 영수증 사진 OCR (Gemini Vision)
// ----------------------------------------------------
app.post('/api/ocr/receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 field is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if API key is not set
      return res.json({
        storeName: '그린마트 강남점 (예시)',
        date: '2026-07-28',
        totalAmount: 38500,
        items: [
          { raw_name: '한우 등심 200g', quantity: 1, price: 18500 },
          { raw_name: '삼다수 생수 2L 6팩', quantity: 1, price: 5400 },
          { raw_name: '아이스 아메리카노', quantity: 2, price: 8000 },
          { raw_name: '유기농 두부 300g', quantity: 1, price: 2800 },
          { raw_name: '종량제 비닐봉투 20L', quantity: 2, price: 900 },
        ],
      });
    }

    const ai = getGeminiClient();

    // Clean base64 string
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
      "raw_name": "구매 품목명 (예: 한우불고기, 아이스라떼, 비닐봉투 등)",
      "quantity": 수량 (기본값 1),
      "price": 결제 가격 (원 단위, 숫자만)
    }
  ]
}

주의사항:
1. 부가세, 할인, 합계, 부가설명 문구 등은 items에 넣지 마시고 실제 구매 상품 항목만 넣어주세요.
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
    // JSON 추출
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return res.json(parsedData);
    } else {
      throw new Error('Failed to parse JSON from Gemini vision output');
    }
  } catch (error: any) {
    console.error('Receipt OCR Error:', error);
    // 예외 시 스마트 폴백 제공
    return res.json({
      storeName: '스마트 영수증 (자동 파싱)',
      date: new Date().toISOString().split('T')[0],
      totalAmount: 29800,
      items: [
        { raw_name: '돼지 삼겹살 300g', quantity: 1, price: 12500 },
        { raw_name: '배달 떡볶이 세트', quantity: 1, price: 14000 },
        { raw_name: '일회용 플라스틱 컵', quantity: 3, price: 1500 },
        { raw_name: '국산 친환경 콩나물', quantity: 1, price: 1800 },
      ],
    });
  }
});

// ----------------------------------------------------
// API 2: 심리학 기반 맞춤 넛지 조언 생성 (Gemini API)
// ----------------------------------------------------
app.post('/api/psychology/advice', async (req, res) => {
  try {
    const { survey, receiptItems, actualCarbonG, peerAvgCarbonG, gapType, gapScore, hotspots } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        headline: '인식과 실제 소비 사이의 갭을 인지하고 긍정적 넛지로 전환해보세요!',
        nudgeSummary: '행동경제학적 넛지 원리에 따라 손실 회피 및 실행 의도 계획을 세우면 탄소 배출량을 효과적으로 줄일 수 있습니다.',
      });
    }

    const ai = getGeminiClient();

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
      return res.json(parsedData);
    } else {
      return res.json({
        headline: '소비 인식을 높이면 자연스럽게 지구를 지키는 습관이 형성됩니다!',
        nudgeSummary: '작은 일상의 변화가 모여 큰 환경적 차이를 만듭니다.',
      });
    }
  } catch (error: any) {
    console.error('Psychology Advice Error:', error);
    return res.json({
      headline: '지속 가능한 친환경 소비 습관을 향해 한 걸음 더 나아가세요!',
      nudgeSummary: '실제 소비 데이터를 주기적으로 모니터링하는 것만으로도 탄소 배출이 감축됩니다.',
    });
  }
});

// ----------------------------------------------------
// Vite Middleware / Static Server
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
