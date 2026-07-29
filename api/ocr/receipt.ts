import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Enable CORS for Vercel Serverless
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
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 field is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'MISSING_GEMINI_API_KEY',
        message: 'Vercel 대시보드의 Environment Variables에 GEMINI_API_KEY를 등록해야 실제 영수증 분석이 작동합니다.'
      });
    }

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
      return res.status(200).json(parsedData);
    } else {
      return res.status(500).json({ error: 'FAILED_TO_PARSE_VISION_OUTPUT', message: '영수증 이미지에서 글자를 파싱하지 못했습니다.' });
    }
  } catch (error: any) {
    console.error('Vercel Receipt OCR Error:', error);
    return res.status(500).json({
      error: 'SERVERLESS_OCR_FAILED',
      message: error?.message || 'Vercel Serverless Function 실행 실패'
    });
  }
}

