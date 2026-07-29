import React, { useState } from 'react';
import { DiagnosticReport, Phase, ReceiptItem, SurveyResponse } from './types';
import { Header } from './components/Header';
import { Phase1Survey } from './components/Phase1Survey';
import { Phase2ReceiptUpload } from './components/Phase2ReceiptUpload';
import { Phase3CarbonCalculation } from './components/Phase3CarbonCalculation';
import { Phase4GapAnalysis } from './components/Phase4GapAnalysis';
import { Phase5PsychologyAdvice } from './components/Phase5PsychologyAdvice';
import { DataSourceModal } from './components/DataSourceModal';
import { BookOpen } from 'lucide-react';

const INITIAL_SURVEY: SurveyResponse = {
  meatFrequency: 'sometimes',
  deliveryFrequency: '1-2',
  ecoProductPreference: 'medium',
  disposableUsage: 'medium',
  transportMode: 'walk_transit',
  perceivedEcoScore: 70,
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('survey');
  const [survey, setSurvey] = useState<SurveyResponse>(INITIAL_SURVEY);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [showDataSources, setShowDataSources] = useState(false);

  const handleReset = () => {
    setPhase('survey');
    setSurvey(INITIAL_SURVEY);
    setReceiptItems([]);
    setReport(null);
  };

  const handleSurveySubmit = (surveyData: SurveyResponse) => {
    setSurvey(surveyData);
    setPhase('receipt');
  };

  const handleReceiptSubmit = (items: ReceiptItem[]) => {
    setReceiptItems(items);
    setPhase('calculation');
  };

  const handleCalculationNext = (rep: DiagnosticReport) => {
    setReport(rep);
    setPhase('gap_analysis');
  };

  const handleGapAnalysisNext = () => {
    setPhase('psychology');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sticky Header */}
      <Header
        currentPhase={phase}
        onReset={handleReset}
        onOpenDataSources={() => setShowDataSources(true)}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {phase === 'survey' && (
          <Phase1Survey initialValues={survey} onSubmit={handleSurveySubmit} />
        )}

        {phase === 'receipt' && (
          <Phase2ReceiptUpload
            onBack={() => setPhase('survey')}
            onSubmit={handleReceiptSubmit}
          />
        )}

        {phase === 'calculation' && (
          <Phase3CarbonCalculation
            survey={survey}
            receiptItems={receiptItems}
            onBack={() => setPhase('receipt')}
            onNext={handleCalculationNext}
          />
        )}

        {phase === 'gap_analysis' && report && (
          <Phase4GapAnalysis
            report={report}
            onBack={() => setPhase('calculation')}
            onNext={handleGapAnalysisNext}
          />
        )}

        {phase === 'psychology' && report && (
          <Phase5PsychologyAdvice
            survey={survey}
            report={report}
            onRestart={handleReset}
            onBack={() => setPhase('gap_analysis')}
          />
        )}
      </main>

      {/* DataSource Modal */}
      <DataSourceModal
        isOpen={showDataSources}
        onClose={() => setShowDataSources(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-900/60 py-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>친환경 소비 자기인식 진단 도구 • Eco-Consumption Diagnostic Engine</span>
          <button
            onClick={() => setShowDataSources(true)}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-md"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>데이터 출처, 탄소계산 산식 및 심리학 근거 논문 보기</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

