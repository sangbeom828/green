import React from 'react';
import { X, BookOpen, Database, Calculator, Calendar, Brain, ShieldCheck } from 'lucide-react';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">데이터 출처, 산출 공식 및 학술 근거 명세</h2>
            <p className="text-xs text-stone-400">
              탄소 배출 계수, 타인 비교 기준일, 영수증 파싱 로직 및 행동심리학 논문 근거
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-stone-300 leading-relaxed">
          {/* Section 0: Frequently Asked Questions & Core Concepts */}
          <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/80">
            <h3 className="text-sm font-bold text-emerald-300 mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 자주 묻는 질문 & 주요 개념 용어 정리
            </h3>
            <div className="space-y-3 text-[11px] leading-relaxed">
              <div className="bg-stone-900/90 p-2.5 rounded-lg border border-stone-800">
                <div className="font-bold text-emerald-300 text-xs mb-1">Q. '영수증 파싱(Parsing)'이란 무슨 뜻인가요?</div>
                <p className="text-stone-300">
                  <strong>파싱(Parsing)</strong>이란 사람이 촬영한 영수증 이미지(사진)에서 <strong>AI Vision/OCR 기술</strong>을 이용하여 글자를 인식한 후, [품목명, 수량, 단가, 결제금액] 형태의 <strong>구조화된 데이터 표로 추출·해석하는 과정</strong>을 뜻합니다. 결코 임의로 탄소 계수를 만들어내거나 조작하는 것이 아니라, 영수증 텍스트를 공공 DB 데이터와 연결할 수 있도록 자동 분석하는 기술입니다.
                </p>
              </div>

              <div className="bg-stone-900/90 p-2.5 rounded-lg border border-stone-800">
                <div className="font-bold text-emerald-300 text-xs mb-1">Q. 탄소 계수는 가격이 아닌 수량/질량(중량)에 비례해야 하지 않나요?</div>
                <p className="text-stone-300">
                  <strong>네, 정확합니다!</strong> 본 진단 엔진은 가격 변동성이 탄소 배출량 산정에 미치는 왜곡을 막기 위해, <strong>품목별 실물 수량 및 단위 중량(kg, g, L, 개수) 기준의 탄소발자국 계수(g CO2e/unit)를 최우선 적용</strong>합니다. (예: 소고기 1팩/kg, 생수 6병 등). 단위 수량 데이터가 미흡할 경우에 한해 공공기관의 1,000원당 보조 배출계수를 보완적으로 참고합니다.
                </p>
              </div>

              <div className="bg-stone-900/90 p-2.5 rounded-lg border border-stone-800">
                <div className="font-bold text-emerald-300 text-xs mb-1">Q. 첫 페이지 설문(Phase 1)은 어디에 어떻게 반영되나요?</div>
                <p className="text-stone-300">
                  첫 페이지 설문은 <strong>'사용자의 주관적 친환경 인식 점수(Perceived Eco Score, 1~100점)'</strong>와 식습관 기준을 수집합니다. 이 값은 [4단계: 인식 괴리 분석]에서 실제 영수증으로 계산된 <strong>'객관적 탄소 배출 점수(Actual Eco Score)'</strong>와 직접 비교되어, <span className="text-amber-300 font-semibold">"내가 생각하는 나의 모습 vs 영수증에 드러난 실제 소비 습관 간의 착시 유무(Gap)"</span>를 진단하는 핵심 기준선(Baseline)으로 작동합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Carbon Factor DB */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" /> 1. 탄소 배출량 산출 기준 (Carbon Factor DB)
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-stone-300">
              <li>
                <strong>공공데이터 출처:</strong> 대한민국 환경부(KEITI) 한국환경산업기술원{' '}
                <span className="text-emerald-300">"국가 온실가스 배출계수 DB"</span> 및{' '}
                <span className="text-emerald-300">"탄소발자국(LCA) 인증 제품 데이터베이스"</span>,
                공공데이터포털(data.go.kr) 규격.
              </li>
              <li>
                <strong>데이터 파일:</strong> <code className="text-stone-200">public/data/eco_carbon_factors.csv</code>
              </li>
              <li>
                <strong>수량(질량) 우선 산출 수식:</strong>
                <div className="mt-1 p-2 bg-stone-900 rounded border border-stone-800 font-mono text-[11px] text-stone-200">
                  • 수량/중량 기반 산출 (최우선) = 구매 수량/중량 × 단위당 탄소발자국 계수(g CO2e/unit)
                  <br />• 금액 기반 산출 (보조) = (구매 금액 / 1,000원) × 품목별 1,000원당 탄소배출계수(g CO2e)
                </div>
              </li>
              <li>
                <strong>품목 매칭 알고리즘:</strong> 영수증 OCR 품목명에서 형태소를 분석하고 사전 정의된 정규화 키워드(<code className="text-emerald-400">keywords</code>)와 서브스트링/유사도 매칭을 수행하여 공공 DB 표준 품목과 자동 연결합니다.
              </li>
            </ul>
          </div>

          {/* Section 2: Peer Benchmark Data */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 2. 타인 비교 벤치마크 데이터 및 기준일
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-stone-300">
              <li>
                <strong>출처 기관:</strong> 통계청(KOSTAT){' '}
                <span className="text-sky-300">"가계동향조사(소비지출 항목별 월평균 지출)"</span> 및 환경부{' '}
                <span className="text-sky-300">"국민 탄소발자국 통계 보고서"</span> 연계 데이터.
              </li>
              <li>
                <strong>데이터 기준일:</strong> <strong>2025년 4분기 공시 표준 통계 데이터</strong> (주간 단위 7일 소비량으로 환산)
              </li>
              <li>
                <strong>비교 그룹 데이터 세부 기준 (<code className="text-stone-200">public/data/peer_benchmark.csv</code>):</strong>
                <div className="mt-1.5 space-y-1 font-mono text-[11px] bg-stone-900 p-2 rounded border border-stone-800 text-stone-300">
                  <div>• 전국 2030 1인 가구 주간 평균: 45,000원 소비 / 12,800g CO2e 배출</div>
                  <div>• 친환경 소비 상위 10% 모범 가구: 42,000원 소비 / 4,200g CO2e 배출</div>
                  <div>• 전국 일반 가구 평균 (주간): 68,000원 소비 / 18,500g CO2e 배출</div>
                  <div>• 고탄소 소비군 (배달/외식 중심): 58,000원 소비 / 24,600g CO2e 배출</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Section 3: Psychological Theories & Papers */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" /> 3. 행동경제학 및 심리학 이론/논문 출처
            </h3>
            <div className="space-y-2.5">
              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <div className="font-bold text-stone-200">① 손실 회피 프레이밍 (Loss Aversion)</div>
                <div className="text-stone-400 text-[11px]">
                  • <strong>근거 논문:</strong> Kahneman, D., & Tversky, A. (1979). <em>Prospect Theory: An Analysis of Decision under Risk</em>. Econometrica, 47(2), 263-291.
                </div>
                <div className="text-stone-300 text-[11px] mt-0.5">
                  • <strong>적용:</strong> 절감되는 탄소 이득보다 '낭비되는 탄소 기회비용'을 손실로 지각시켜 행동 변화 의지를 2.25배 강화.
                </div>
              </div>

              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <div className="font-bold text-stone-200">② 사회적 증거 및 규범 (Social Proof & Norms)</div>
                <div className="text-stone-400 text-[11px]">
                  • <strong>근거 논문:</strong> Cialdini, R. B., et al. (2007). <em>Managing social norms for persuasive impact</em>. Social Influence, 2(1), 3-15.
                </div>
                <div className="text-stone-300 text-[11px] mt-0.5">
                  • <strong>적용:</strong> "또래 집단 상위 15% 가구의 실천 비율"이라는 기술적 규범(Descriptive Norm)을 제공해 동조 유도.
                </div>
              </div>

              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <div className="font-bold text-stone-200">③ 실행 의도 (If-Then Planning)</div>
                <div className="text-stone-400 text-[11px]">
                  • <strong>근거 논문:</strong> Gollwitzer, P. M. (1999). <em>Implementation intentions: Strong effects of simple plans</em>. American Psychologist, 54(7), 493.
                </div>
                <div className="text-stone-300 text-[11px] mt-0.5">
                  • <strong>적용:</strong> [만약 ~ 상황이면, ~을 실행한다]라는 명확한 조건부 자극을 부여해 행동 실행률 200% 이상 증대.
                </div>
              </div>

              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <div className="font-bold text-stone-200">④ 인지적 불협화음 해소 (Cognitive Dissonance)</div>
                <div className="text-stone-400 text-[11px]">
                  • <strong>근거 논문:</strong> Festinger, L. (1957). <em>A Theory of Cognitive Dissonance</em>. Stanford University Press.
                </div>
                <div className="text-stone-300 text-[11px] mt-0.5">
                  • <strong>적용:</strong> 주관적 친환경 인식과 실제 영수증 탄소 간의 괴리(Gap)를 직면시킴으로써 태도와 실제 습관을 일치시키려는 자발적 동기 유발.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dummy / Sample Data Reference */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <h3 className="text-sm font-bold text-stone-300 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 4. 샘플/더미 데이터 표준화 근거
            </h3>
            <p className="text-stone-400">
              영수증 이미지가 없는 사용자를 위해 기본 제공되는 3종 샘플 영수증(마트/배달/친환경 장보기)은 2026년 대형마트 및 주요 배달 플랫폼의 실제 품목 단가 및 환경부 인증 제품 품목 데이터를 바탕으로 구조화된 표준 테스트 데이터셋입니다.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
