import React, { useState } from 'react';
import { SurveyResponse } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Utensils, ShoppingBag, Truck, Zap } from 'lucide-react';

interface Phase1SurveyProps {
  initialValues: SurveyResponse;
  onSubmit: (survey: SurveyResponse) => void;
}

export const Phase1Survey: React.FC<Phase1SurveyProps> = ({ initialValues, onSubmit }) => {
  const [survey, setSurvey] = useState<SurveyResponse>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(survey);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-gradient-to-br from-emerald-900/30 via-stone-900 to-stone-900 border border-emerald-800/40 rounded-2xl p-6 mb-8 text-stone-100 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Phase 1. 주관적 자기인식 평가
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">
          귀하의 평소 소비 습관과 친환경 인식을 진단합니다
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          이 도구의 목적은 <strong className="text-emerald-400 font-semibold">"내가 생각하는 나"</strong>와{' '}
          <strong className="text-emerald-400 font-semibold">"실제 영수증으로 확인한 탄소 발자국"</strong>의
          격차를 정밀하게 비교 분석하는 것입니다. 평소 소비 패턴을 솔직하게 체크해 주세요!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Q1: 식생활 육류 소비 */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <label className="flex items-center gap-2 text-stone-200 font-semibold text-base mb-3">
            <Utensils className="w-5 h-5 text-emerald-400" />
            1. 주간 육류(소/돼지/닭 등) 소비 빈도는 어느 정도인가요?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'rarely', label: '주 1회 이하 (주로 채식)', desc: '저탄소 식단 선호' },
              { id: 'sometimes', label: '주 2~3회', desc: '평균적 식단' },
              { id: 'frequently', label: '주 4~5회', desc: '육류 중심' },
              { id: 'daily', label: '매일 소비 (주 6회 이상)', desc: '고탄소 육류 선호' },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSurvey({ ...survey, meatFrequency: item.id as any })}
                className={`p-3.5 rounded-lg border text-left transition-all text-sm ${
                  survey.meatFrequency === item.id
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <div className="font-medium text-stone-100">{item.label}</div>
                <div className="text-xs text-stone-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Q2: 배달/외식 빈도 */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <label className="flex items-center gap-2 text-stone-200 font-semibold text-base mb-3">
            <Truck className="w-5 h-5 text-emerald-400" />
            2. 일주일에 배달 음식이나 외식을 몇 회 이용하시나요?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'none', label: '거의 없음 (주 0회)', desc: '집밥/직접 조리' },
              { id: '1-2', label: '주 1~2회', desc: '가끔 외식' },
              { id: '3-4', label: '주 3~4회', desc: '자주 이용' },
              { id: '5+', label: '주 5회 이상', desc: '배달/외식 의존' },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSurvey({ ...survey, deliveryFrequency: item.id as any })}
                className={`p-3.5 rounded-lg border text-left transition-all text-sm ${
                  survey.deliveryFrequency === item.id
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <div className="font-medium text-stone-100">{item.label}</div>
                <div className="text-xs text-stone-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Q3: 친환경 인증 및 일회용품 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
            <label className="flex items-center gap-2 text-stone-200 font-semibold text-sm mb-3">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              3. 친환경/저탄소 인증 상품 구매 선호도
            </label>
            <div className="flex gap-2">
              {[
                { id: 'low', label: '고려 안함' },
                { id: 'medium', label: '보통 (인식함)' },
                { id: 'high', label: '우선 구매' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSurvey({ ...survey, ecoProductPreference: item.id as any })}
                  className={`flex-1 py-2.5 px-3 rounded-lg border text-center text-xs font-medium transition-all ${
                    survey.ecoProductPreference === item.id
                      ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
            <label className="flex items-center gap-2 text-stone-200 font-semibold text-sm mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              4. 일회용품(비닐/플라스틱) 사용 느낌
            </label>
            <div className="flex gap-2">
              {[
                { id: 'low', label: '최소화 노력' },
                { id: 'medium', label: '평균 수준' },
                { id: 'high', label: '자주 사용하는 편' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSurvey({ ...survey, disposableUsage: item.id as any })}
                  className={`flex-1 py-2.5 px-3 rounded-lg border text-center text-xs font-medium transition-all ${
                    survey.disposableUsage === item.id
                      ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Q5: 주관적 친환경 자신감 슬라이더 */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/40 border border-emerald-800/50 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-stone-100 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              5. 귀하가 생각하는 스스로의 '주관적 친환경 점수'는 몇 점인가요?
            </label>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {survey.perceivedEcoScore}
              <span className="text-xs text-stone-400 font-normal"> / 100점</span>
            </span>
          </div>

          <p className="text-xs text-stone-400 mb-5">
            1점(친환경에 미흡) ~ 100점(철저한 저탄소 환경실천가) 사이에서 스스로에게 점수를 매겨주세요.
          </p>

          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={survey.perceivedEcoScore}
            onChange={(e) => setSurvey({ ...survey, perceivedEcoScore: parseInt(e.target.value) })}
            className="w-full h-3 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
          />

          <div className="flex justify-between text-xs text-stone-500 mt-2 font-medium">
            <span>10점 (저탄소 인식 부족)</span>
            <span>50점 (보통의 일반인)</span>
            <span>100점 (완벽한 저탄소 실천가)</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-900/40 transition-all text-base"
          >
            <span>설문 완료 및 영수증 수집(Phase 2)으로 이동</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
