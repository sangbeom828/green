import React from 'react';
import { Leaf, RotateCcw, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Phase } from '../types';

interface HeaderProps {
  currentPhase: Phase;
  onReset: () => void;
  onOpenDataSources?: () => void;
}

const PHASES: { id: Phase; label: string; step: number }[] = [
  { id: 'survey', label: '1. 인식 설문', step: 1 },
  { id: 'receipt', label: '2. 영수증 수집', step: 2 },
  { id: 'calculation', label: '3. 탄소 산출', step: 3 },
  { id: 'gap_analysis', label: '4. 괴리 분석', step: 4 },
  { id: 'psychology', label: '5. 심리 넛지', step: 5 },
];

export const Header: React.FC<HeaderProps> = ({ currentPhase, onReset, onOpenDataSources }) => {
  const currentStepIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 px-4 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              친환경 소비 자기인식 진단 도구
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-medium hidden sm:inline-block">
                AI Diagnostic Engine
              </span>
            </h1>
            <p className="text-xs text-stone-400">
              인식과 실제 소비의 괴리를 측정하는 탄소 메타인지 분석기
            </p>
          </div>
        </div>

        {/* Phase Stepper */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 text-xs">
          {PHASES.map((p, idx) => {
            const isActive = p.id === currentPhase;
            const isDone = idx < currentStepIndex;

            return (
              <React.Fragment key={p.id}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm ring-1 ring-emerald-400/50'
                      : isDone
                      ? 'bg-stone-800/80 text-emerald-400 border border-emerald-900/50'
                      : 'bg-stone-800/40 text-stone-500 border border-stone-800'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-stone-700/60 text-[10px] flex items-center justify-center">
                      {p.step}
                    </span>
                  )}
                  <span className="whitespace-nowrap">{p.label}</span>
                </div>
                {idx < PHASES.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-stone-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenDataSources && (
            <button
              onClick={onOpenDataSources}
              className="flex items-center gap-1.5 text-xs bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/80 px-2.5 py-1.5 rounded-lg transition-colors"
              title="탄소 산출 기준 및 심리학 이론 근거 보기"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">출처 및 근거</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-stone-700 hover:border-stone-500 transition-colors"
            title="진단 새로 시작하기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>
        </div>
      </div>
    </header>
  );
};

