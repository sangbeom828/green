import React, { useEffect, useState } from 'react';
import { DiagnosticReport, PsychologyNudgeCard, SurveyResponse } from '../types';
import { getPsychologyAdvice } from '../utils/geminiClient';
import {
  Brain,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Share2,
  Printer,
  ArrowLeft,
  Zap,
  Award,
  Lightbulb,
} from 'lucide-react';

interface Phase5PsychologyAdviceProps {
  survey: SurveyResponse;
  report: DiagnosticReport;
  onRestart: () => void;
  onBack: () => void;
}

interface AiAdvice {
  headline?: string;
  nudgeSummary?: string;
  psychologicalType?: string;
  behavioralTip?: string;
}

export const Phase5PsychologyAdvice: React.FC<Phase5PsychologyAdviceProps> = ({
  survey,
  report,
  onRestart,
  onBack,
}) => {
  const [aiAdvice, setAiAdvice] = useState<AiAdvice | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingAi(true);

    getPsychologyAdvice({
      survey,
      actualCarbonG: report.actualCarbonG,
      peerAvgCarbonG: report.peerAvgCarbonG,
      gapType: report.gapType,
      gapScore: report.gapScore,
      hotspots: report.hotspots,
    })
      .then((data) => {
        if (isMounted) {
          setAiAdvice(data);
          setLoadingAi(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching psychology advice:', err);
        if (isMounted) setLoadingAi(false);
      });

    return () => {
      isMounted = false;
    };
  }, [survey, report]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-fadeIn print:p-0 print:max-w-none">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-6 shadow-xl print:border-none print:shadow-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Brain className="w-3.5 h-3.5" /> Phase 5. 심리학 기반 행동 넛지(Nudge) 조언
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          인지적 불협화음을 해소하는 맞춤형 행동경제학 조언
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          인식과 실제 소비의 갭을 인지하는 순간 행동 변화의 기회가 생깁니다.{' '}
          <strong className="text-emerald-400 font-semibold">
            손실 회피, 사회적 동조, 실행 의도(If-Then)
          </strong>{' '}
          원리를 활용한 실천 카드를 확인해보세요.
        </p>
      </div>

      {/* AI Behavioral Psychology Headline */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border border-emerald-500/40 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              AI 심리학 코치 넛지 메시지
            </div>
            {loadingAi ? (
              <div className="text-sm text-stone-400 animate-pulse">
                Gemini AI가 행동 심리학 기반 넛지 조언을 생성 중입니다...
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-extrabold text-white mb-2">
                  "{aiAdvice?.headline || '작은 인식 변화가 지구를 바꾸는 지속 가능한 소비로 이어집니다.'}"
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  {aiAdvice?.nudgeSummary}
                </p>
                {aiAdvice?.behavioralTip && (
                  <div className="mt-3 p-3 bg-stone-950/80 rounded-xl border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>실천 팁:</strong> {aiAdvice.behavioralTip}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nudge Cards Grid */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          심리학 기반 3대 행동 개입 카드 (Behavioral Action Cards)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {report.nudgeCards.map((card) => (
            <div
              key={card.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-emerald-600/60 transition-all group"
            >
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 inline-block mb-3">
                  {card.theory_tag}
                </span>
                <h4 className="text-sm font-bold text-stone-100 mb-2 group-hover:text-emerald-300 transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  {card.description}
                </p>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800/80">
                <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 구체적 실행 액션:
                </div>
                <p className="text-xs text-stone-200 font-medium">
                  {card.action_step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Diagnostic Summary Printable Report */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            종합 진단 결과 리포트 요약
          </h3>
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-lg border border-stone-700 transition-colors print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>리포트 인쇄/저장</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-500">주관적 친환경 점수</div>
            <div className="text-xl font-bold font-mono text-stone-100 mt-1">
              {report.perceivedEcoScore}점
            </div>
          </div>
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-500">실제 탄소 환산 점수</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {report.actualEcoScore}점
            </div>
          </div>
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-500">영수증 탄소 배출량</div>
            <div className="text-xl font-bold font-mono text-stone-100 mt-1">
              {report.actualCarbonG.toLocaleString()}g
            </div>
          </div>
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-500">타인 대비 비교비율</div>
            <div
              className={`text-xl font-bold font-mono mt-1 ${
                report.peerComparisonPercent > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {report.peerComparisonPercent > 0
                ? `+${report.peerComparisonPercent}%`
                : `${report.peerComparisonPercent}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Restart & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 (Phase 4)</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm w-full sm:w-auto justify-center"
        >
          <RotateCcw className="w-4 h-4" />
          <span>새로운 영수증으로 다시 진단하기</span>
        </button>
      </div>
    </div>
  );
};
