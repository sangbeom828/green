import React, { useState, useEffect } from 'react';
import { CarbonFactorItem, ReceiptItem } from '../types';
import { findBestFactorMatch, loadEcoCarbonFactors } from '../utils/csvParser';
import { calculateReceiptItemCarbon } from '../utils/carbonCalculator';
import {
  Upload,
  Camera,
  Plus,
  Trash2,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Phase2ReceiptUploadProps {
  onBack: () => void;
  onSubmit: (receiptItems: ReceiptItem[]) => void;
}

const SAMPLE_RECEIPTS = [
  {
    name: '마트 장보기 샘플 (소고기/생수/일회용품)',
    items: [
      { raw_name: '한우 불고기 300g', price: 21000, quantity: 1 },
      { raw_name: '삼다수 생수 2L 6팩', price: 5800, quantity: 1 },
      { raw_name: '일회용 비닐장갑 100매', price: 3200, quantity: 1 },
      { raw_name: '국산 유기농 두부', price: 2900, quantity: 1 },
      { raw_name: '사과 1봉지 (4입)', price: 8500, quantity: 1 },
    ],
  },
  {
    name: '배달/카페 샘플 (배달떡볶이/카페음료)',
    items: [
      { raw_name: '마라 떡볶이 배달 세트', price: 19500, quantity: 1 },
      { raw_name: '아이스 카페라떼 (일회용컵)', price: 5500, quantity: 2 },
      { raw_name: '배달 팁 및 일회용 용기비', price: 3500, quantity: 1 },
      { raw_name: '햄버거 치킨너겟 세트', price: 11000, quantity: 1 },
    ],
  },
  {
    name: '저탄소 친환경 장보기 샘플',
    items: [
      { raw_name: '저탄소 친환경 사과 1kg', price: 7900, quantity: 1 },
      { raw_name: '귀리 오트밀크 음료 1L', price: 4200, quantity: 1 },
      { raw_name: '리필 전용 친환경 세탁세제', price: 8900, quantity: 1 },
      { raw_name: '국산 팽이버섯/콩나물', price: 2100, quantity: 1 },
    ],
  },
];

export const Phase2ReceiptUpload: React.FC<Phase2ReceiptUploadProps> = ({
  onBack,
  onSubmit,
}) => {
  const [factors, setFactors] = useState<CarbonFactorItem[]>([]);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  useEffect(() => {
    loadEcoCarbonFactors().then((data) => {
      setFactors(data);
      // 초기에는 샘플 1번 자동 세팅
      applySampleReceipt(0, data);
    });
  }, []);

  const processExtractedItems = (
    rawList: { raw_name: string; price: number; quantity?: number }[],
    factorList: CarbonFactorItem[] = factors
  ) => {
    const processed: ReceiptItem[] = rawList.map((item, idx) => {
      const match = findBestFactorMatch(item.raw_name, factorList);
      const qty = item.quantity || 1;
      const carbonG = calculateReceiptItemCarbon(item.price, qty, match);

      return {
        id: `item_${Date.now()}_${idx}`,
        raw_name: item.raw_name,
        quantity: qty,
        price: item.price,
        matched_factor_id: match.id,
        matched_name: match.item_name,
        category: match.category,
        carbon_g: carbonG,
        eco_alternative: match.eco_friendly_alternative,
        reduction_tip: match.reduction_tip,
      };
    });

    setReceiptItems(processed);
  };

  const applySampleReceipt = (index: number, factorList = factors) => {
    const sample = SAMPLE_RECEIPTS[index];
    if (!sample) return;
    processExtractedItems(sample.items, factorList);
    setSelectedFileName(sample.name);
    setStatusMessage(`'${sample.name}' 데이터가 매칭되었습니다.`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsLoading(true);
    setStatusMessage('Gemini Vision AI가 영수증 이미지의 품목을 파싱 중입니다...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const res = await fetch('/api/ocr/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        if (!res.ok) throw new Error('Receipt parsing server error');
        const data = await res.json();

        if (data.items && Array.isArray(data.items)) {
          processExtractedItems(data.items);
          setStatusMessage(`Gemini OCR 성공! ${data.items.length}개 품목이 파싱되었습니다.`);
        } else {
          throw new Error('No items found in receipt');
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setStatusMessage('OCR 파싱 실패. 폴백 예시 영수증 데이터를 적용합니다.');
      applySampleReceipt(0);
      setIsLoading(false);
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof ReceiptItem,
    value: any
  ) => {
    setReceiptItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // 매칭 factor 변경 시 recalculate
        if (field === 'matched_factor_id') {
          const factor = factors.find((f) => f.id === value);
          if (factor) {
            updated.matched_name = factor.item_name;
            updated.category = factor.category;
            updated.eco_alternative = factor.eco_friendly_alternative;
            updated.reduction_tip = factor.reduction_tip;
            updated.carbon_g = calculateReceiptItemCarbon(
              updated.price,
              updated.quantity,
              factor
            );
          }
        } else if (field === 'price' || field === 'quantity') {
          const factor = factors.find((f) => f.id === updated.matched_factor_id) || factors[0];
          if (factor) {
            updated.carbon_g = calculateReceiptItemCarbon(
              updated.price,
              updated.quantity,
              factor
            );
          }
        }

        return updated;
      })
    );
  };

  const handleAddItem = () => {
    const defaultFactor = factors[0] || {
      id: 'CF001',
      category: '간편식/가공식품',
      item_name: '일반 상품',
      carbon_factor_per_1000krw: 200,
      carbon_factor_per_unit: 250,
      eco_friendly_alternative: '친환경 인증 대체재',
      reduction_tip: '',
    };

    const newItem: ReceiptItem = {
      id: `item_${Date.now()}`,
      raw_name: '신규 영수증 품목',
      quantity: 1,
      price: 5000,
      matched_factor_id: defaultFactor.id,
      matched_name: defaultFactor.item_name,
      category: defaultFactor.category,
      carbon_g: calculateReceiptItemCarbon(5000, 1, defaultFactor),
      eco_alternative: defaultFactor.eco_friendly_alternative,
      reduction_tip: defaultFactor.reduction_tip,
    };

    setReceiptItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setReceiptItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = receiptItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalCarbonG = receiptItems.reduce((sum, item) => sum + (item.carbon_g || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Camera className="w-3.5 h-3.5" /> Phase 2. 영수증 수집 및 CSV 탄소 계수 매칭
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          영수증 사진을 찍어 실제 구매 내역의 탄소 발자국을 추출합니다
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          업로드된 영수증은 Gemini Vision OCR을 거쳐 표준 탄소 계수 DB(<code className="text-emerald-400">eco_carbon_factors.csv</code>)의 품목과 자동 매칭됩니다.
          수량, 가격, 매칭 카테고리를 직접 수정하실 수 있습니다.
        </p>

        {/* Upload Zone & Sample Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* File Upload Box */}
          <label className="md:col-span-2 relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-700 hover:border-emerald-500 bg-stone-950/60 rounded-xl cursor-pointer transition-all hover:bg-stone-950">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-emerald-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-semibold">Gemini Vision 파싱 중...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-stone-200 font-bold text-sm">
                  영수증 사진 촬영 또는 이미지 파일 선택
                </div>
                <p className="text-xs text-stone-500">
                  JPG, PNG, WEBP 포맷 지원 (카메라 direct 촬영 가능)
                </p>
              </div>
            )}
          </label>

          {/* Sample Select Box */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 영수증 사진이 없으신가요?
              </div>
              <p className="text-xs text-stone-400 mb-3">
                준비된 대표 샘플 영수증을 선택하여 즉시 분석을 진행해보세요:
              </p>
              <div className="space-y-1.5">
                {SAMPLE_RECEIPTS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySampleReceipt(idx)}
                    className="w-full text-left text-xs p-2 rounded-lg bg-stone-900 border border-stone-800 hover:border-emerald-600 hover:text-emerald-300 transition-all text-stone-300 truncate"
                  >
                    • {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className="mt-4 p-3 bg-stone-950 border border-stone-800 rounded-lg flex items-center gap-2 text-xs text-stone-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* CSV Matching Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              추출된 영수증 및 CSV DB 매칭 내역
            </h3>
            <p className="text-xs text-stone-400">
              영수증 품목명과 CSV 표준 탄소 계수 DB 매칭 결과를 확인하고 조정하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-lg border border-stone-700 transition-all font-medium"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>품목 직접 추가</span>
          </button>
        </div>

        {receiptItems.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            영수증 사진을 업로드하거나 샘플을 선택해주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider bg-stone-950/50">
                  <th className="py-3 px-3">영수증 품목명</th>
                  <th className="py-3 px-3">수량</th>
                  <th className="py-3 px-3">금액 (원)</th>
                  <th className="py-3 px-3">CSV 매칭 항목</th>
                  <th className="py-3 px-3 text-right">산출 탄소량 (g CO2e)</th>
                  <th className="py-3 px-2 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {receiptItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    {/* Raw Name */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.raw_name}
                        onChange={(e) => handleItemChange(item.id, 'raw_name', e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-3 w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 w-28">
                      <input
                        type="number"
                        step="100"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(item.id, 'price', parseInt(e.target.value) || 0)
                        }
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-200 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </td>

                    {/* Matched Factor Select */}
                    <td className="py-2.5 px-3 min-w-[200px]">
                      <select
                        value={item.matched_factor_id}
                        onChange={(e) => handleItemChange(item.id, 'matched_factor_id', e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-200 focus:border-emerald-500 focus:outline-none truncate"
                      >
                        {factors.map((f) => (
                          <option key={f.id} value={f.id}>
                            [{f.category}] {f.item_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Calculated Carbon */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {item.carbon_g.toLocaleString()} g
                    </td>

                    {/* Delete */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-stone-500 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary Bar */}
        {receiptItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-950 p-4 rounded-xl">
            <div className="text-xs text-stone-400 space-y-0.5">
              <div>
                총 결제 금액: <strong className="text-stone-100">{totalAmount.toLocaleString()}원</strong>
              </div>
              <div>
                총 파싱 품목: <strong className="text-stone-100">{receiptItems.length}개</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-stone-400">영수증 전체 산출 탄소량</div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {totalCarbonG.toLocaleString()} <span className="text-xs font-normal">g CO2e</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 (Phase 1)</span>
        </button>

        <button
          type="button"
          disabled={receiptItems.length === 0}
          onClick={() => onSubmit(receiptItems)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
        >
          <span>탄소 산출 및 타인 비교(Phase 3)로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
