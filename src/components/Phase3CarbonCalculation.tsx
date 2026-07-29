import React, { useEffect, useState } from 'react';
import { DiagnosticReport, PeerBenchmarkData, ReceiptItem, SurveyResponse } from '../types';
import { generateDiagnosticReport } from '../utils/carbonCalculator';
import { loadPeerBenchmark } from '../utils/csvParser';
import {
  BarChart2,
  ArrowRight,
  ArrowLeft,
  Users,
  Flame,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles,
} from 'lucide-react';

interface Phase3CarbonCalculationProps {
  survey: SurveyResponse;
  receiptItems: ReceiptItem[];
  onBack: () => void;
  onNext: (report: DiagnosticReport) => void;
}

export const Phase3CarbonCalculation: React.FC<Phase3CarbonCalculationProps> = ({
  survey,
  receiptItems,
  onBack,
  onNext,
}) => {
  const [benchmarks, setBenchmarks] = useState<PeerBenchmarkData[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  useEffect(() => {
    loadPeerBenchmark().then((data) => {
      setBenchmarks(data);
      const peerAvg = data[0]?.avg_carbon_g || 12800;
      const rep = generateDiagnosticReport(survey, receiptItems, peerAvg);
      setReport(rep);
    });
  }, [survey, receiptItems]);

  const handleBenchmarkGroupChange = (index: number) => {
    setSelectedGroupIndex(index);
    const peerAvg = benchmarks[index]?.avg_carbon_g || 12800;
    const rep = generateDiagnosticReport(survey, receiptItems, peerAvg);
    setReport(rep);
  };

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-stone-400">
        탄소 산출 및 타인 비교 데이터 연산 중...
      </div>
    );
  }

  const selectedBenchmark = benchmarks[selectedGroupIndex] || {
    group_name: '전국 2030 1인 가구 평균',
    avg_carbon_g: 12800,
  };

  const isMoreThanPeer = report.peerComparisonPercent > 0;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <BarChart2 className="w-3.5 h-3.5" /> Phase 3. 탄소 배출 산출 및 타인 집단 비교
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          영수증 기반 산출 결과 및 타인 평균 대비 배출 비교
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          수집된 영수증 내역을 바탕으로 <strong>실물 단위 수량 및 중량(kg, g, 개수) 기준 환경부 배출계수 DB</strong>를 최우선 적용하여 탄소 배출량을 정밀 환산하였습니다.{' '}
          <strong className="text-emerald-400 font-semibold">
            내가 다른 사람과 비교하여 얼마나 더 많이 또는 적게 쓰고 있는지
          </strong>
          를 직관적으로 분석합니다.
        </p>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Card 1: My Total Carbon */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-emerald-800/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-stone-400 mb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-400" />
              나의 영수증 총 탄소 배출량
            </div>
            <div className="text-3xl font-black text-white font-mono mt-2">
              {report.actualCarbonG.toLocaleString()} <span className="text-sm font-normal text-stone-400">g CO2e</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
            <span>객관적 탄소점수 환산:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{report.actualEcoScore}점</span>
          </div>
        </div>

        {/* Card 2: Peer Benchmark Selection */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-stone-400 mb-1 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" />
              비교 대상 타인 평균 데이터
            </div>
            <div className="text-3xl font-black text-sky-300 font-mono mt-2">
              {selectedBenchmark.avg_carbon_g.toLocaleString()} <span className="text-sm font-normal text-stone-400">g CO2e</span>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[11px] text-stone-500 mb-1 block">비교 타인 집단 선택:</label>
            <select
              value={selectedGroupIndex}
              onChange={(e) => handleBenchmarkGroupChange(parseInt(e.target.value))}
              className="w-full bg-stone-950 border border-stone-800 text-xs rounded-lg px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500"
            >
              {benchmarks.map((b, idx) => (
                <option key={b.group_id} value={idx}>
                  {b.group_name} ({b.avg_carbon_g.toLocaleString()}g)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card 3: Peer Comparison Difference */}
        <div
          className={`border rounded-2xl p-5 shadow-lg flex flex-col justify-between ${
            isMoreThanPeer
              ? 'bg-gradient-to-br from-amber-950/30 to-stone-900 border-amber-800/60'
              : 'bg-gradient-to-br from-emerald-950/30 to-stone-900 border-emerald-800/60'
          }`}
        >
          <div>
            <div className="text-xs text-stone-400 mb-1 flex items-center gap-1.5">
              {isMoreThanPeer ? (
                <TrendingUp className="w-4 h-4 text-amber-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              )}
              타인 평균 대비 비교 지표
            </div>
            <div
              className={`text-3xl font-black font-mono mt-2 ${
                isMoreThanPeer ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {isMoreThanPeer ? `+${report.peerComparisonPercent}%` : `${report.peerComparisonPercent}%`}
            </div>
          </div>
          <p className="text-xs text-stone-300 mt-3 leading-relaxed">
            {report.peerComparisonText}
          </p>
        </div>
      </div>

      {/* Visual Comparison Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-8 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          타인 평균과 나의 탄소 배출 직관 비교 바
        </h3>
        <p className="text-xs text-stone-400 mb-6">
          선택된 비교 그룹({selectedBenchmark.group_name})과 나의 영수증 탄소량을 시각적으로 비교합니다.
        </p>

        <div className="space-y-5">
          {/* My Carbon Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-stone-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                나의 소비 탄소 배출량
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {report.actualCarbonG.toLocaleString()} g CO2e
              </span>
            </div>
            <div className="w-full bg-stone-950 rounded-full h-4 overflow-hidden border border-stone-800">
              <div
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    (report.actualCarbonG / Math.max(report.actualCarbonG, selectedBenchmark.avg_carbon_g, 1)) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Peer Average Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-stone-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                {selectedBenchmark.group_name} 평균
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {selectedBenchmark.avg_carbon_g.toLocaleString()} g CO2e
              </span>
            </div>
            <div className="w-full bg-stone-950 rounded-full h-4 overflow-hidden border border-stone-800">
              <div
                className="bg-gradient-to-r from-sky-600 to-sky-400 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    (selectedBenchmark.avg_carbon_g /
                      Math.max(report.actualCarbonG, selectedBenchmark.avg_carbon_g, 1)) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Item & Category Carbon Breakdown Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl mb-8">
        <h3 className="text-base font-bold text-white mb-4">
          카테고리별 탄소 배출 비중
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.categoryBreakdown.map((cat, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-stone-950 border border-stone-800/80 rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-stone-200">{cat.category}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  비중: {cat.percentage}%
                </div>
              </div>
              <div className="text-right font-mono font-bold text-emerald-400 text-sm">
                {cat.carbon_g.toLocaleString()} g
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 (Phase 2)</span>
        </button>

        <button
          type="button"
          onClick={() => onNext(report)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
        >
          <span>인식-실제 괴리 분석(Phase 4)으로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
