import React from 'react';
import { DiagnosticReport } from '../types';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Award,
  Target,
  Flame,
  Zap,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

interface Phase4GapAnalysisProps {
  report: DiagnosticReport;
  onBack: () => void;
  onNext: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Phase4GapAnalysis: React.FC<Phase4GapAnalysisProps> = ({
  report,
  onBack,
  onNext,
}) => {
  // Radar Data for Gap Comparison
  const radarData = [
    { subject: '주관적 친환경 인식', score: report.perceivedEcoScore },
    { subject: '실제 탄소 절감 점수', score: report.actualEcoScore },
    { subject: '타인 평균 점수 환산', score: 50 },
  ];

  // Bar Data for Category Breakdown
  const categoryBarData = report.categoryBreakdown.map((cat) => ({
    name: cat.category,
    carbon: cat.carbon_g,
  }));

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Target className="w-3.5 h-3.5" /> Phase 4. 주관적 인식 vs 실제 탄소 괴리 분석
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          나의 주관적 친환경 점수 vs 객관적 탄소 발자국 괴리(Gap) 진단
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          <strong>1단계 설문(Phase 1)에서 응답하신 주관적 친환경 점수</strong>(<strong className="text-emerald-400">{report.perceivedEcoScore}점</strong>)와
          영수증 데이터 기반 실제 탄소 절감 점수(
          <strong className="text-emerald-400">{report.actualEcoScore}점</strong>)의 차이를 정밀
          진단합니다.
        </p>
      </div>

      {/* Main Gap Type Diagnosis Card */}
      <div
        className={`rounded-2xl p-6 mb-8 border shadow-2xl relative overflow-hidden ${
          report.gapType === 'overestimated'
            ? 'bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border-amber-500/50'
            : report.gapType === 'underestimated'
            ? 'bg-gradient-to-r from-stone-900 via-sky-950/30 to-stone-900 border-sky-500/50'
            : 'bg-gradient-to-r from-stone-900 via-emerald-950/30 to-stone-900 border-emerald-500/50'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {report.gapType === 'overestimated' ? (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              ) : report.gapType === 'underestimated' ? (
                <Award className="w-6 h-6 text-sky-400" />
              ) : (
                <Sparkles className="w-6 h-6 text-emerald-400" />
              )}
              <h3 className="text-xl font-bold text-white">{report.gapTitle}</h3>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl">
              {report.gapDescription}
            </p>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800 text-center shrink-0 min-w-[180px]">
            <div className="text-xs text-stone-400 mb-1">인식 - 실제 괴리율(Gap)</div>
            <div
              className={`text-3xl font-black font-mono ${
                report.gapScore > 0
                  ? 'text-amber-400'
                  : report.gapScore < 0
                  ? 'text-sky-400'
                  : 'text-emerald-400'
              }`}
            >
              {report.gapScore > 0 ? `+${report.gapScore}점` : `${report.gapScore}점`}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {report.gapScore > 0 ? '자아착시 존재' : '인식 일치/겸손'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart: Perceived vs Actual vs Peer */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                주관적 인식 vs 실제 탄소점수 레이더 차트
              </h4>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium">
                Phase 1 설문 반영됨
              </span>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              설문에서 선택한 주관적 점수({report.perceivedEcoScore}점), 실제 영수증 환산 점수({report.actualEcoScore}점), 타인 평균을 대조합니다.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" />
                <Radar
                  name="점수"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Category Carbon Distribution */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-400" />
              카테고리별 탄소 기여도 파이 차트
            </h4>
            <p className="text-xs text-stone-400 mb-4">
              내 영수증에서 어떤 카테고리가 탄소를 가장 많이 차지하는지 분석합니다.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="carbon_g"
                >
                  {report.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()} g CO2e`, '탄소량']}
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Carbon Hotspots (탄소 배출 주범 Top 3) */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl mb-8">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          탄소 배출 주범 Top 3 (Hotspot Items)
        </h3>
        <p className="text-xs text-stone-400 mb-5">
          이번 구매 내역 중 가장 많은 탄소를 배출한 품목과 친환경 대체재 절감 기대치입니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.hotspots.map((item, idx) => (
            <div
              key={idx}
              className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    TOP {idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {item.carbonG.toLocaleString()} g CO2e
                  </span>
                </div>
                <div className="font-bold text-stone-100 text-sm mb-1">{item.itemName}</div>
                <div className="text-xs text-stone-400">
                  전체 탄소 중 <strong className="text-stone-200">{item.percentageOfTotal}%</strong> 차지
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 text-xs">
                <div className="text-stone-400 text-[11px] mb-1">추천 친환경 대체재:</div>
                <div className="text-emerald-400 font-semibold">{item.alternative}</div>
                <div className="text-stone-500 text-[10px] mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-emerald-400" />
                  전환 시 약 {item.savingsG.toLocaleString()}g 탄소 절감 가능
                </div>
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
          <span>이전 (Phase 3)</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
        >
          <span>심리학 기반 조언 생성(Phase 5)으로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
